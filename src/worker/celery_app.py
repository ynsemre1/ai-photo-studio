import json
import logging
import shlex
import subprocess

from celery import Celery

from src.config.settings import settings

logger = logging.getLogger(__name__)

app = Celery("worker")
app.config_from_object("src.worker.celeryconfig")


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
    error: str | None = None,
    stderr_tail: str | None = None,
):
    payload = {"job": job_name, "status": status}
    if returncode is not None:
        payload["returncode"] = returncode
    if error is not None:
        payload["error"] = error
    if stderr_tail:
        payload["stderr_tail"] = stderr_tail
    logger.info(json.dumps(payload))


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------

@app.task(bind=True, name="pipeline.run")
def run_pipeline_task(self):
    cmd = shlex.split(settings.pipeline_command)
    completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        stderr_tail = _tail(completed.stderr, settings.pipeline_stdio_tail_lines)
        log_job_event(
            "pipeline.run",
            "failed",
            returncode=completed.returncode,
            stderr_tail=stderr_tail,
        )
        raise RuntimeError(f"Pipeline failed with code {completed.returncode}")
    log_job_event("pipeline.run", "success", returncode=0)


@app.task(bind=True, name="pipeline.ingest_news")
def run_ingest_news_task(self):
    cmd = shlex.split(settings.ingest_news_command)
    completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        stderr_tail = _tail(completed.stderr, settings.pipeline_stdio_tail_lines)
        log_job_event(
            "pipeline.ingest_news",
            "failed",
            returncode=completed.returncode,
            stderr_tail=stderr_tail,
        )
        raise RuntimeError(f"Ingest news failed with code {completed.returncode}")
    log_job_event("pipeline.ingest_news", "success", returncode=0)


# ---------------------------------------------------------------------------
# Self-heal subprocess (reference — already uses capture_output=True)
# ---------------------------------------------------------------------------

def _run_self_heal_pipeline_subprocess(cmd: list[str]) -> subprocess.CompletedProcess:
    completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        stderr_tail = _tail(completed.stderr, settings.pipeline_stdio_tail_lines)
        log_job_event(
            "self_heal_pipeline",
            "failed",
            returncode=completed.returncode,
            stderr_tail=stderr_tail,
        )
    return completed


@app.task(bind=True, name="pipeline.self_heal")
def self_heal_pipeline_task(self):
    cmd = shlex.split(settings.pipeline_command)
    result = _run_self_heal_pipeline_subprocess(cmd)
    if result.returncode != 0:
        raise RuntimeError(f"Self-heal pipeline failed with code {result.returncode}")
    log_job_event("self_heal_pipeline", "success", returncode=0)
