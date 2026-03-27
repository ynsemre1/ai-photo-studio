from __future__ import annotations

import logging

from celery import Celery
from celery.schedules import crontab

from src.config.settings import settings

logger = logging.getLogger(__name__)

app = Celery("ai_photo_studio", broker=settings.redis_url)

app.conf.beat_schedule = {
    "cleanup-expired-sessions": {
        "task": "src.worker.celery_app.cleanup_expired_sessions_task",
        "schedule": crontab(minute="0", hour="*/1"),
    },
    "sync-usage-stats": {
        "task": "src.worker.celery_app.sync_usage_stats_task",
        "schedule": crontab(minute="*/5"),
    },
    "reap-stale-runs": {
        "task": "src.worker.celery_app.reap_stale_runs_task",
        "schedule": crontab(minute="*/10"),
    },
}


@app.task(name="src.worker.celery_app.cleanup_expired_sessions_task")
def cleanup_expired_sessions_task() -> None:
    logger.info("Running cleanup_expired_sessions_task")


@app.task(name="src.worker.celery_app.sync_usage_stats_task")
def sync_usage_stats_task() -> None:
    logger.info("Running sync_usage_stats_task")


@app.task(name="src.worker.celery_app.reap_stale_runs_task")
def reap_stale_runs_task() -> None:
    from src.db.session import SessionLocal
    from src.services.analyze_runs_store import reap_stale_runs

    logger.info("Running reap_stale_runs_task via Celery")
    db = SessionLocal()
    try:
        reaped = reap_stale_runs(db, stale_minutes=settings.stale_run_threshold_minutes)
        logger.info("Celery reap_stale_runs completed, reaped=%d", reaped)
    finally:
        db.close()
