import logging
import time
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

DEFAULT_LLM_CONFIG = {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "timeout": 30,
    "temperature": 0.3,
    "max_retries": 1,
}


def _build_system_prompt(mode: str) -> str:
    if mode == "detailed":
        return (
            "You are an expert image analysis assistant. "
            "Provide a detailed explanation of the analysis report."
        )
    return (
        "You are an expert image analysis assistant. "
        "Provide a brief summary of the analysis report."
    )


def _build_envelope(report: dict, mode: str) -> dict:
    return {
        "report": report,
        "mode": mode,
    }


def _provider_failure_response(message: str, mode: str) -> dict:
    return {
        "success": False,
        "explanation": None,
        "error": message,
        "mode": mode,
    }


def _success_response(explanation: str, mode: str) -> dict:
    return {
        "success": True,
        "explanation": explanation,
        "error": None,
        "mode": mode,
    }


def explain_from_report(
    report: dict,
    mode: str = "summary",
    llm_config: dict[str, Any] | None = None,
) -> dict:
    config = {**DEFAULT_LLM_CONFIG, **(llm_config or {})}

    provider_name = config["provider"]
    model = config["model"]
    timeout = int(config["timeout"])
    temperature = float(config["temperature"])
    max_retries = int(config.get("max_retries", 1))

    system_prompt = _build_system_prompt(mode)
    envelope = _build_envelope(report, mode)

    try:
        provider = create_llm_provider(provider_name)
    except Exception:
        logger.exception("Failed to create LLM provider '%s'", provider_name)
        return _provider_failure_response("Explanation generation failed", mode)

    last_exc: Exception | None = None
    for attempt in range(1 + max_retries):
        try:
            explanation_text = provider.generate_explanation(
                system_prompt=system_prompt,
                payload=envelope,
                model=model,
                timeout=timeout,
                temperature=temperature,
            ).strip()
            break
        except (LLMTimeoutError, LLMRateLimitError) as exc:
            last_exc = exc
            if attempt < max_retries:
                wait = 2**attempt
                logger.warning(
                    "Retryable error on attempt %d/%d for provider '%s': %s. "
                    "Retrying in %ds...",
                    attempt + 1,
                    1 + max_retries,
                    provider_name,
                    exc,
                    wait,
                )
                time.sleep(wait)
                continue
            logger.error(
                "Provider '%s' failed after %d attempts: %s",
                provider_name,
                1 + max_retries,
                exc,
            )
            return _provider_failure_response("Explanation generation failed", mode)
        except (LLMValidationError, LLMAuthError, LLMAPIError) as exc:
            logger.error("Non-retryable LLM error from '%s': %s", provider_name, exc)
            return _provider_failure_response("Explanation generation failed", mode)
    else:
        return _provider_failure_response("Explanation generation failed", mode)

    if not explanation_text:
        return _provider_failure_response("Empty explanation received", mode)

    return _success_response(explanation_text, mode)
