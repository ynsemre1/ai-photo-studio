from __future__ import annotations

import logging
from typing import Any

from src.services.llm_providers import (
    LLMAPIError,
    LLMAuthError,
    LLMRateLimitError,
    LLMTimeoutError,
    LLMValidationError,
    create_llm_provider,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Default configuration
# ---------------------------------------------------------------------------

DEFAULT_LLM_CONFIG: dict[str, Any] = {
    "provider": "openai",
    "model": "gpt-4",
    "timeout": 30,
    "temperature": 0.3,
    "max_retries": 1,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _provider_failure_response(message: str, mode: str) -> dict[str, Any]:
    """Return a standardised soft-fail payload when the LLM call cannot succeed."""
    return {
        "status": "error",
        "message": message,
        "mode": mode,
    }


def _build_system_prompt(mode: str) -> str:
    """Return the system prompt appropriate for the requested explanation *mode*."""
    base = (
        "You are an expert image-analysis assistant. "
        "Provide a clear, structured explanation of the photo report."
    )
    if mode == "detailed":
        return f"{base} Be thorough and cover every finding."
    return base


def _build_envelope(report: dict[str, Any]) -> dict[str, Any]:
    """Wrap the raw report in the envelope format expected by LLM providers."""
    return {"report": report}


# ---------------------------------------------------------------------------
# Transient vs permanent error classification
# ---------------------------------------------------------------------------

_TRANSIENT_ERRORS = (LLMTimeoutError, LLMRateLimitError)
_PERMANENT_ERRORS = (LLMValidationError, LLMAuthError, LLMAPIError)


# ---------------------------------------------------------------------------
# Core public API
# ---------------------------------------------------------------------------


def explain_from_report(
    report: dict[str, Any],
    *,
    mode: str = "summary",
    llm_config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Generate a natural-language explanation for *report* via an LLM.

    Parameters
    ----------
    report:
        The structured photo-analysis report to explain.
    mode:
        ``"summary"`` (default) or ``"detailed"``.
    llm_config:
        Optional overrides merged on top of ``DEFAULT_LLM_CONFIG``.

    Returns
    -------
    dict
        ``{"status": "ok", "explanation": "...", "mode": "..."}`` on success,
        or a soft-fail dict produced by ``_provider_failure_response`` on error.
    """
    cfg = {**DEFAULT_LLM_CONFIG, **(llm_config or {})}

    provider_name: str = cfg["provider"]
    model: str = cfg["model"]
    timeout: int = int(cfg.get("timeout", 30))
    temperature: float = float(cfg.get("temperature", 0.3))
    max_retries: int = int(cfg.get("max_retries", 1))

    system_prompt = _build_system_prompt(mode)
    envelope = _build_envelope(report)

    last_error: Exception | None = None

    for attempt in range(1 + max_retries):
        try:
            provider = create_llm_provider(provider_name)
            explanation_text = provider.generate_explanation(
                system_prompt=system_prompt,
                payload=envelope,
                model=model,
                timeout=timeout,
                temperature=temperature,
            ).strip()

            if attempt > 0:
                logger.info(
                    "llm_retry succeeded on attempt=%d/%d",
                    attempt + 1,
                    1 + max_retries,
                )

            return {
                "status": "ok",
                "explanation": explanation_text,
                "mode": mode,
            }

        except _TRANSIENT_ERRORS as exc:
            last_error = exc
            if attempt < max_retries:
                logger.warning(
                    "llm_retry attempt=%d/%d error=%s",
                    attempt + 1,
                    max_retries,
                    type(exc).__name__,
                )
                continue
            logger.error(
                "llm_retry exhausted after %d attempts, last_error=%s",
                1 + max_retries,
                type(exc).__name__,
            )
            return _provider_failure_response(
                "Explanation generation failed", mode
            )

        except _PERMANENT_ERRORS:
            return _provider_failure_response(
                "Explanation generation failed", mode
            )

    # Should never be reached, but keeps mypy happy.
    return _provider_failure_response("Explanation generation failed", mode)


# ---------------------------------------------------------------------------
# Artifact builder (downstream consumer)
# ---------------------------------------------------------------------------


def build_explanation_master_artifacts(
    report: dict[str, Any],
    *,
    mode: str = "summary",
    llm_config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """High-level helper that calls ``explain_from_report`` and wraps the
    result into the artifact structure consumed by ``artifact_writer``."""
    result = explain_from_report(report, mode=mode, llm_config=llm_config)

    if result["status"] != "ok":
        return result

    return {
        "status": "ok",
        "artifacts": [
            {
                "type": "explanation",
                "mode": mode,
                "content": result["explanation"],
            }
        ],
    }
