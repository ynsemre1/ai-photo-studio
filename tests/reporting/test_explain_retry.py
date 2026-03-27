from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from src.services.explain_service import explain_from_report
from src.services.llm_providers.exceptions import (
    LLMAPIError,
    LLMAuthError,
    LLMRateLimitError,
    LLMTimeoutError,
    LLMValidationError,
)

SAMPLE_REPORT = {"score": 85, "findings": ["good lighting"]}


def _make_provider(side_effect):
    provider = MagicMock()
    provider.generate_explanation.side_effect = side_effect
    return provider


# ------------------------------------------------------------------ #
# Retry on transient errors
# ------------------------------------------------------------------ #


class TestRetryOnTransientErrors:
    @patch("src.services.explain_service.create_llm_provider")
    def test_succeeds_after_timeout_then_ok(self, mock_create):
        """First call times out, second succeeds → should return ok."""
        provider = _make_provider(
            [LLMTimeoutError("timeout"), "  explanation text  "]
        )
        mock_create.return_value = provider

        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 1})

        assert result["status"] == "ok"
        assert result["explanation"] == "explanation text"
        assert provider.generate_explanation.call_count == 2

    @patch("src.services.explain_service.create_llm_provider")
    def test_succeeds_after_rate_limit_then_ok(self, mock_create):
        """First call rate-limited, second succeeds → should return ok."""
        provider = _make_provider(
            [LLMRateLimitError("rate limit"), "ok response"]
        )
        mock_create.return_value = provider

        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 1})

        assert result["status"] == "ok"
        assert result["explanation"] == "ok response"

    @patch("src.services.explain_service.create_llm_provider")
    def test_exhausts_retries_on_repeated_timeout(self, mock_create):
        """All attempts time out → should return error."""
        provider = _make_provider(
            [LLMTimeoutError("t1"), LLMTimeoutError("t2")]
        )
        mock_create.return_value = provider

        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 1})

        assert result["status"] == "error"
        assert provider.generate_explanation.call_count == 2

    @patch("src.services.explain_service.create_llm_provider")
    def test_custom_max_retries(self, mock_create):
        """Honour max_retries=3 from llm_config."""
        provider = _make_provider(
            [
                LLMTimeoutError("t1"),
                LLMTimeoutError("t2"),
                LLMTimeoutError("t3"),
                "finally",
            ]
        )
        mock_create.return_value = provider

        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 3})

        assert result["status"] == "ok"
        assert result["explanation"] == "finally"
        assert provider.generate_explanation.call_count == 4


# ------------------------------------------------------------------ #
# No retry on permanent errors
# ------------------------------------------------------------------ #


class TestNoRetryOnPermanentErrors:
    @pytest.mark.parametrize(
        "exc_cls",
        [LLMAuthError, LLMValidationError, LLMAPIError],
        ids=["auth", "validation", "api"],
    )
    @patch("src.services.explain_service.create_llm_provider")
    def test_permanent_error_no_retry(self, mock_create, exc_cls):
        """Permanent errors must fail immediately without retry."""
        provider = _make_provider([exc_cls("fail")])
        mock_create.return_value = provider

        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 3})

        assert result["status"] == "error"
        assert provider.generate_explanation.call_count == 1


# ------------------------------------------------------------------ #
# Happy path (no errors)
# ------------------------------------------------------------------ #


class TestHappyPath:
    @patch("src.services.explain_service.create_llm_provider")
    def test_first_call_succeeds(self, mock_create):
        provider = _make_provider(["all good"])
        mock_create.return_value = provider

        result = explain_from_report(SAMPLE_REPORT)

        assert result["status"] == "ok"
        assert result["explanation"] == "all good"
        assert provider.generate_explanation.call_count == 1

    @patch("src.services.explain_service.create_llm_provider")
    def test_default_max_retries_is_one(self, mock_create):
        """Default config gives 1 retry (2 total attempts)."""
        provider = _make_provider(
            [LLMTimeoutError("t1"), LLMTimeoutError("t2")]
        )
        mock_create.return_value = provider

        result = explain_from_report(SAMPLE_REPORT)

        assert result["status"] == "error"
        assert provider.generate_explanation.call_count == 2
