"""Analyze dispatch service — routes analysis jobs to Celery workers or
falls back to synchronous execution when no live worker is available.
"""

from __future__ import annotations

import logging
import threading
import time
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from celery import Celery

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Settings placeholder — in production this is typically injected via DI or
# imported from a central config module.
# ---------------------------------------------------------------------------


class _Settings:
    celery_enabled: bool = True


settings = _Settings()

# ---------------------------------------------------------------------------
# Rate-limited warning state — prevents log spam when workers are down.
# ---------------------------------------------------------------------------
_CELERY_WARNING_INTERVAL_S: float = 60.0
_celery_probe_last_warning: float = 0.0
_celery_warning_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Celery probe cache — avoids a Redis round-trip on every dispatch call.
#   _celery_probe_cache: (monotonic_timestamp, is_alive)
#   _CELERY_PROBE_CACHE_TTL: seconds before the cached result expires
# ---------------------------------------------------------------------------
_CELERY_PROBE_CACHE_TTL: float = 5.0
_celery_probe_cache: tuple[float, bool] = (0.0, False)
_celery_probe_cache_lock = threading.Lock()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _emit_rate_limited_warning(msg: str) -> None:
    """Log *msg* at WARNING level at most once per ``_CELERY_WARNING_INTERVAL_S``."""
    global _celery_probe_last_warning
    now = time.monotonic()
    with _celery_warning_lock:
        if now - _celery_probe_last_warning >= _CELERY_WARNING_INTERVAL_S:
            logger.warning(msg)
            _celery_probe_last_warning = now


def _celery_has_live_worker(celery_app: Celery) -> bool:
    """Return ``True`` if at least one Celery worker responds to a ping.

    Results are cached for ``_CELERY_PROBE_CACHE_TTL`` seconds so that
    high-traffic dispatch paths do not incur a Redis round-trip on every
    call.
    """
    global _celery_probe_cache

    now = time.monotonic()
    with _celery_probe_cache_lock:
        cached_at, cached_result = _celery_probe_cache
        if now - cached_at < _CELERY_PROBE_CACHE_TTL:
            return cached_result

    try:
        response: dict[str, Any] | None = (
            celery_app.control.inspect(timeout=0.5).ping()
        )
        is_alive = bool(response)
    except Exception:
        logger.debug("Celery inspect ping failed", exc_info=True)
        is_alive = False

    with _celery_probe_cache_lock:
        _celery_probe_cache = (time.monotonic(), is_alive)

    if not is_alive:
        _emit_rate_limited_warning(
            "No live Celery workers detected — falling back to sync execution."
        )

    return is_alive


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def dispatch_background_analyze(
    celery_app: Celery,
    payload: dict[str, Any],
) -> dict[str, Any]:
    """Dispatch an analysis job to a Celery worker when available, otherwise
    execute it synchronously.

    Parameters
    ----------
    celery_app:
        The Celery application instance.
    payload:
        Arbitrary analysis parameters forwarded to the task.

    Returns
    -------
    dict
        A result envelope with ``{"status": "queued" | "sync", ...}`` keys.
    """
    if settings.celery_enabled and _celery_has_live_worker(celery_app):
        result = celery_app.send_task(
            "analyze.run",
            kwargs=payload,
        )
        return {"status": "queued", "task_id": result.id}

    return _run_sync_analysis(payload)


def _run_sync_analysis(payload: dict[str, Any]) -> dict[str, Any]:
    """Fallback: execute the analysis synchronously in-process."""
    logger.info("Running analysis synchronously (no Celery worker available).")
    # In production this delegates to the actual analysis logic.
    return {"status": "sync", "payload": payload}
