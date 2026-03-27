"""Analyze dispatch service — routes analysis jobs to available backends.

Supports Celery (primary) with PGQueuer as fallback, and a thread-based
fallback as last resort.
"""

import asyncio
import logging
import os
import threading
import uuid
from typing import Any, Optional

import asyncpg
from pgqueuer.db import AsyncpgDriver
from pgqueuer.queries import Queries

logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "")
CELERY_ENABLED = os.environ.get("CELERY_ENABLED", "false").lower() == "true"

# ---------------------------------------------------------------------------
# Module-level persistent connection for sync pgqueuer enqueue
# ---------------------------------------------------------------------------
# Instead of creating a new asyncpg connection + event loop on every enqueue
# call, we maintain a single persistent connection that is lazily initialized
# and automatically reconnected on failure.
# ---------------------------------------------------------------------------
_enqueue_connection: Optional[asyncpg.Connection] = None
_enqueue_lock = threading.Lock()


async def _get_or_create_connection() -> asyncpg.Connection:
    """Return the persistent asyncpg connection, creating or reconnecting as needed.

    This is called within an event loop managed by `_enqueue_pgqueuer_sync`.
    Thread safety is ensured by the caller holding `_enqueue_lock`.
    """
    global _enqueue_connection

    if _enqueue_connection is not None:
        if _enqueue_connection.is_closed():
            logger.warning("Persistent enqueue connection was closed, reconnecting")
            _enqueue_connection = None
        else:
            return _enqueue_connection

    logger.info("Creating persistent asyncpg connection for enqueue")
    _enqueue_connection = await asyncpg.connect(dsn=DATABASE_URL)
    return _enqueue_connection


async def _close_enqueue_connection_async() -> None:
    """Close the persistent enqueue connection (async helper)."""
    global _enqueue_connection
    if _enqueue_connection is not None and not _enqueue_connection.is_closed():
        await _enqueue_connection.close()
        _enqueue_connection = None


def close_enqueue_connection() -> None:
    """Close the persistent enqueue connection. Call at application shutdown.

    Safe to call from sync context (e.g. FastAPI shutdown event).
    """
    global _enqueue_connection
    with _enqueue_lock:
        if _enqueue_connection is not None:
            try:
                loop = asyncio.new_event_loop()
                loop.run_until_complete(_close_enqueue_connection_async())
            finally:
                loop.close()
            logger.info("Persistent enqueue connection closed")


# ---------------------------------------------------------------------------
# Enqueue helpers
# ---------------------------------------------------------------------------

# Module-level event loop reused across sync enqueue calls.
# Created once and kept alive so we avoid the overhead of
# asyncio.run() (which creates + destroys a loop every time).
_enqueue_loop: Optional[asyncio.AbstractEventLoop] = None


def _get_or_create_event_loop() -> asyncio.AbstractEventLoop:
    """Return a persistent event loop for sync enqueue calls."""
    global _enqueue_loop
    if _enqueue_loop is None or _enqueue_loop.is_closed():
        _enqueue_loop = asyncio.new_event_loop()
    return _enqueue_loop


def _enqueue_pgqueuer_sync(
    job_type: str,
    payload: dict[str, Any],
    priority: int = 0,
) -> bool:
    """Enqueue a job into PGQueuer from a synchronous context.

    Uses a persistent asyncpg connection and a reusable event loop to avoid
    the overhead of TCP handshake + auth + event loop create/destroy on every call.

    Args:
        job_type: The queue/entrypoint name for the job.
        payload: JSON-serializable job payload.
        priority: Job priority (higher = processed first).

    Returns:
        True if the job was enqueued successfully, False otherwise.
    """

    async def _enqueue() -> None:
        conn = await _get_or_create_connection()
        driver = AsyncpgDriver(conn)
        queries = Queries(driver)
        await queries.enqueue(
            entrypoint=job_type,
            payload=payload,
            priority=priority,
        )

    with _enqueue_lock:
        try:
            loop = _get_or_create_event_loop()
            loop.run_until_complete(_enqueue())
            return True
        except (
            asyncpg.PostgresError,
            asyncpg.InterfaceError,
            OSError,
        ) as exc:
            logger.error("PGQueuer enqueue failed: %s", exc)
            # Invalidate connection so next call reconnects
            global _enqueue_connection
            _enqueue_connection = None
            return False
        except Exception:
            logger.exception("Unexpected error during PGQueuer enqueue")
            _enqueue_connection = None
            return False


# ---------------------------------------------------------------------------
# Thread-based fallback (last resort)
# ---------------------------------------------------------------------------


def _run_analysis_in_thread(
    image_id: str,
    payload: dict[str, Any],
) -> None:
    """Run the analysis directly in a background thread (fallback)."""
    logger.warning(
        "Running analysis in thread fallback for image_id=%s",
        image_id,
    )
    # Actual analysis logic would be imported and called here
    # from src.api.services.analysis_engine import run_analysis
    # run_analysis(image_id, payload)


# ---------------------------------------------------------------------------
# Main dispatch entry point
# ---------------------------------------------------------------------------


def dispatch_background_analyze(
    image_id: str,
    user_id: str,
    options: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Dispatch an image analysis job to the best available backend.

    Dispatch priority:
        1. Celery (if enabled and workers available)
        2. PGQueuer (persistent connection, sync enqueue)
        3. Thread fallback (last resort)

    Args:
        image_id: Unique identifier for the image to analyze.
        user_id: ID of the user requesting the analysis.
        options: Optional analysis configuration.

    Returns:
        A dict with 'status', 'backend', and 'job_id' keys.
    """
    job_id = str(uuid.uuid4())
    payload = {
        "image_id": image_id,
        "user_id": user_id,
        "job_id": job_id,
        **(options or {}),
    }

    # 1. Try Celery
    if CELERY_ENABLED:
        try:
            from src.worker.celery_tasks import analyze_image_task

            analyze_image_task.delay(**payload)
            logger.info("Job %s dispatched via Celery", job_id)
            return {"status": "queued", "backend": "celery", "job_id": job_id}
        except Exception:
            logger.warning("Celery dispatch failed, falling back to PGQueuer")

    # 2. Try PGQueuer with persistent connection
    if _enqueue_pgqueuer_sync("analyze_image", payload, priority=0):
        logger.info("Job %s dispatched via PGQueuer", job_id)
        return {"status": "queued", "backend": "pgqueuer", "job_id": job_id}

    # 3. Thread fallback
    logger.warning("PGQueuer enqueue failed, falling back to thread for job %s", job_id)
    thread = threading.Thread(
        target=_run_analysis_in_thread,
        args=(image_id, payload),
        daemon=True,
    )
    thread.start()
    return {"status": "processing", "backend": "thread", "job_id": job_id}
