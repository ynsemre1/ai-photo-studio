from __future__ import annotations

import logging
import signal
import subprocess
import sys
import threading
from datetime import datetime, timezone
from typing import Any

from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED, JobExecutionEvent
from apscheduler.schedulers.background import BackgroundScheduler

from src.config.settings import settings

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(
    job_defaults={
        "max_instances": 1,
        "coalesce": True,
    },
    timezone="UTC",
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def log_job_event(event: JobExecutionEvent) -> None:
    if event.exception:
        logger.error(
            "Job %s failed: %s",
            event.job_id,
            event.exception,
            exc_info=event.traceback,
        )
    else:
        logger.info("Job %s executed successfully (retval=%s)", event.job_id, event.retval)


scheduler.add_listener(log_job_event, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)


# ---------------------------------------------------------------------------
# Scheduled jobs
# ---------------------------------------------------------------------------

def _run_cleanup_expired_sessions_job() -> None:
    from src.db.session import SessionLocal

    logger.info("[scheduler] cleanup_expired_sessions started")
    db = SessionLocal()
    try:
        from src.services.session_store import cleanup_expired_sessions

        cleanup_expired_sessions(db)
    finally:
        db.close()
    logger.info("[scheduler] cleanup_expired_sessions finished")


def _run_sync_usage_stats_job() -> None:
    from src.db.session import SessionLocal

    logger.info("[scheduler] sync_usage_stats started")
    db = SessionLocal()
    try:
        from src.services.usage_stats_store import sync_usage_stats

        sync_usage_stats(db)
    finally:
        db.close()
    logger.info("[scheduler] sync_usage_stats finished")


def _run_check_pending_jobs() -> None:
    from src.db.session import SessionLocal

    logger.info("[scheduler] check_pending_jobs started")
    db = SessionLocal()
    try:
        from src.services.job_queue_store import check_pending_jobs

        check_pending_jobs(db)
    finally:
        db.close()
    logger.info("[scheduler] check_pending_jobs finished")


def _run_refresh_model_cache_job() -> None:
    logger.info("[scheduler] refresh_model_cache started")
    from src.services.model_cache import refresh_model_cache

    refresh_model_cache()
    logger.info("[scheduler] refresh_model_cache finished")


def _run_purge_old_results_job() -> None:
    from src.db.session import SessionLocal

    logger.info("[scheduler] purge_old_results started")
    db = SessionLocal()
    try:
        from src.services.results_store import purge_old_results

        purge_old_results(db)
    finally:
        db.close()
    logger.info("[scheduler] purge_old_results finished")


def _run_health_ping_job() -> None:
    logger.info("[scheduler] health_ping at %s", datetime.now(timezone.utc).isoformat())


def _run_pipeline_job() -> None:
    logger.info("[scheduler] pipeline job started")
    cmd = [sys.executable, "-m", "src.pipeline.run"]
    completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        stderr_tail = (
            "\n".join(completed.stderr.splitlines()[-settings.pipeline_stdio_tail_lines :])
            if completed.stderr
            else ""
        )
        logger.error(
            "[scheduler] pipeline job failed (returncode=%d)\n%s",
            completed.returncode,
            stderr_tail,
        )
    else:
        logger.info("[scheduler] pipeline job finished (returncode=0)")


def run_ingest_news_job() -> None:
    logger.info("[scheduler] ingest_news job started")
    cmd = [sys.executable, "-m", "src.pipeline.ingest_news"]
    completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        stderr_tail = (
            "\n".join(completed.stderr.splitlines()[-settings.pipeline_stdio_tail_lines :])
            if completed.stderr
            else ""
        )
        logger.error(
            "[scheduler] ingest_news job failed (returncode=%d)\n%s",
            completed.returncode,
            stderr_tail,
        )
    else:
        logger.info("[scheduler] ingest_news job finished (returncode=0)")


def _run_reap_stale_runs_job() -> None:
    from src.db.session import SessionLocal
    from src.services.analyze_runs_store import reap_stale_runs

    logger.info("[scheduler] reap_stale_runs started")
    db = SessionLocal()
    try:
        reaped = reap_stale_runs(db, stale_minutes=settings.stale_run_threshold_minutes)
        logger.info("[scheduler] reap_stale_runs finished, reaped=%d", reaped)
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Register jobs
# ---------------------------------------------------------------------------

scheduler.add_job(
    _run_cleanup_expired_sessions_job,
    "interval",
    hours=1,
    id="cleanup_expired_sessions",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    _run_sync_usage_stats_job,
    "interval",
    minutes=5,
    id="sync_usage_stats",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    _run_check_pending_jobs,
    "interval",
    minutes=1,
    id="check_pending_jobs",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    _run_refresh_model_cache_job,
    "interval",
    hours=6,
    id="refresh_model_cache",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    _run_purge_old_results_job,
    "interval",
    hours=24,
    id="purge_old_results",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    _run_health_ping_job,
    "interval",
    minutes=5,
    id="health_ping",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    _run_pipeline_job,
    "interval",
    hours=1,
    id="run_pipeline",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    run_ingest_news_job,
    "interval",
    hours=2,
    id="ingest_news",
    max_instances=1,
    coalesce=True,
)

scheduler.add_job(
    _run_reap_stale_runs_job,
    "interval",
    minutes=10,
    id="reap_stale_runs",
    max_instances=1,
    coalesce=True,
)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

def start_scheduler() -> None:
    logger.info("Starting APScheduler with %d jobs", len(scheduler.get_jobs()))
    scheduler.start()

    shutdown_event = threading.Event()

    def _handle_signal(signum: int, frame: Any) -> None:
        logger.info("Received signal %s, shutting down scheduler…", signum)
        scheduler.shutdown(wait=False)
        shutdown_event.set()

    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    shutdown_event.wait()
    logger.info("Scheduler stopped.")
    sys.exit(0)


if __name__ == "__main__":
    logging.basicConfig(level=settings.log_level)
    start_scheduler()
