from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def reap_stale_runs(db: Session, *, stale_minutes: int = 15) -> int:
    """Mark runs stuck in queued/running state as failed.

    Returns the number of reaped runs.
    """
    from src.db.models import AnalyzeRun, RunStatus

    threshold = datetime.now(timezone.utc) - timedelta(minutes=stale_minutes)

    stale_runs = (
        db.query(AnalyzeRun)
        .filter(
            AnalyzeRun.status.in_([RunStatus.QUEUED, RunStatus.RUNNING]),
            AnalyzeRun.updated_at < threshold,
        )
        .all()
    )

    count = 0
    for run in stale_runs:
        run.status = RunStatus.FAILED
        run.error_message = f"Reaped: stuck for >{stale_minutes} minutes"
        run.finished_at = datetime.now(timezone.utc)
        count += 1

    if count:
        db.commit()
        logger.info("Reaped %d stale run(s) (threshold=%d min)", count, stale_minutes)

    return count
