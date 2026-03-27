import json
import logging
import shlex
import subprocess
from datetime import datetime, timezone

from apscheduler.schedulers.blocking import BlockingScheduler

from src.config.settings import settings

logger = logging.getLogger(__name__)
scheduler = BlockingScheduler()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _tail(text: str, n: int) -> str:
    lines = (text or "").strip().splitlines()
    return "\n".join(lines[-n:]) if lines else ""


def log_job_event(
    job_name: str,
    status: str,
    returncode: int | None = None,
    duration_s: float | None = None,
    error: str | None = None,
    stderr_tail: str | None = None,
):
    payload = {"job": job_name, "status": status}
    if returncode is not None:
        payload["returncode"] = returncode
    if duration_s is not None:
        payload["duration_s"] = round(duration_s, 2)
    if error is not None:
        payload["error"] = error
    if stderr_tail:
        payload["stderr_tail"] = stderr_tail
    logger.info(json.dumps(payload))


# ---------------------------------------------------------------------------
# Pipeline job
# ---------------------------------------------------------------------------

def _run_pipeline_job():
    job_name = "pipeline.run"
    cmd = shlex.split(settings.pipeline_command)
    start = datetime.now(timezone.utc)

    print(json.dumps({"job": job_name, "event": "started", "cmd": cmd}))

    try:
        completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    except Exception as exc:
        duration_s = (datetime.now(timezone.utc) - start).total_seconds()
        print(json.dumps({"job": job_name, "event": "error", "error": str(exc)}))
        log_job_event(job_name, "error", error=str(exc), duration_s=duration_s)
        return

    duration_s = (datetime.now(timezone.utc) - start).total_seconds()

    if completed.returncode != 0:
        stderr_tail = _tail(completed.stderr, settings.pipeline_stdio_tail_lines)
        print(json.dumps({
            "job": job_name,
            "event": "failed",
            "returncode": completed.returncode,
        }))
        log_job_event(
            job_name,
            "failed",
            returncode=completed.returncode,
            duration_s=duration_s,
            stderr_tail=stderr_tail,
        )
        return

    print(json.dumps({"job": job_name, "event": "success", "duration_s": round(duration_s, 2)}))
    log_job_event(job_name, "success", returncode=0, duration_s=duration_s)


# ---------------------------------------------------------------------------
# Error / success logging (kept separate for downstream consumers)
# ---------------------------------------------------------------------------

def _handle_pipeline_failure(job_name, returncode, duration_s, stderr_tail=None):
    log_job_event(
        job_name,
        "failed",
        returncode=returncode,
        duration_s=duration_s,
        stderr_tail=stderr_tail,
    )


def _handle_pipeline_success(job_name, duration_s):
    log_job_event(
        job_name,
        "success",
        returncode=0,
        duration_s=duration_s,
    )


# ---------------------------------------------------------------------------
# Ingest news job
# ---------------------------------------------------------------------------

def run_ingest_news_job():
    job_name = "pipeline.ingest_news"
    cmd = shlex.split(settings.ingest_news_command)
    start = datetime.now(timezone.utc)

    print(json.dumps({"job": job_name, "event": "started", "cmd": cmd}))

    try:
        completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    except Exception as exc:
        duration_s = (datetime.now(timezone.utc) - start).total_seconds()
        print(json.dumps({"job": job_name, "event": "error", "error": str(exc)}))
        log_job_event(job_name, "error", error=str(exc), duration_s=duration_s)
        return

    duration_s = (datetime.now(timezone.utc) - start).total_seconds()

    if completed.returncode != 0:
        stderr_tail = _tail(completed.stderr, settings.pipeline_stdio_tail_lines)
        print(json.dumps({
            "job": job_name,
            "event": "failed",
            "returncode": completed.returncode,
        }))
        log_job_event(
            job_name,
            "failed",
            returncode=completed.returncode,
            duration_s=duration_s,
            stderr_tail=stderr_tail,
        )
        return

    print(json.dumps({"job": job_name, "event": "success", "duration_s": round(duration_s, 2)}))
    log_job_event(job_name, "success", returncode=0, duration_s=duration_s)


# ---------------------------------------------------------------------------
# Scheduler registration
# ---------------------------------------------------------------------------

scheduler.add_job(
    _run_pipeline_job,
    "cron",
    hour=settings.pipeline_cron_hour,
    id="pipeline_run",
)

scheduler.add_job(
    run_ingest_news_job,
    "cron",
    hour=settings.ingest_news_cron_hour,
    id="ingest_news",
)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    scheduler.start()
