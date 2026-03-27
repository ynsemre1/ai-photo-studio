from unittest.mock import MagicMock, patch

import pytest

from src.services.explain_service import explain_from_report
from src.services.llm_providers.base import (
    LLMAuthError,
    LLMRateLimitError,
    LLMTimeoutError,
    LLMValidationError,
)

SAMPLE_REPORT = {"score": 85, "tags": ["portrait", "outdoor"]}


@pytest.fixture
def mock_provider():
    provider = MagicMock()
    with patch(
        "src.services.explain_service.create_llm_provider", return_value=provider
    ):
        yield provider


class TestRetryOnTimeout:
    def test_succeeds_after_timeout_retry(self, mock_provider):
        mock_provider.generate_explanation.side_effect = [
            LLMTimeoutError("timeout"),
            "Explanation text",
        ]
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 1})
        assert result["success"] is True
        assert result["explanation"] == "Explanation text"
        assert mock_provider.generate_explanation.call_count == 2

    def test_fails_after_all_timeout_retries_exhausted(self, mock_provider):
        mock_provider.generate_explanation.side_effect = LLMTimeoutError("timeout")
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 1})
        assert result["success"] is False
        assert mock_provider.generate_explanation.call_count == 2


class TestRetryOnRateLimit:
    def test_succeeds_after_rate_limit_retry(self, mock_provider):
        mock_provider.generate_explanation.side_effect = [
            LLMRateLimitError("rate limited"),
            "Recovered explanation",
        ]
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 1})
        assert result["success"] is True
        assert result["explanation"] == "Recovered explanation"
        assert mock_provider.generate_explanation.call_count == 2

    def test_fails_after_all_rate_limit_retries_exhausted(self, mock_provider):
        mock_provider.generate_explanation.side_effect = LLMRateLimitError("rate limited")
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 1})
        assert result["success"] is False
        assert mock_provider.generate_explanation.call_count == 2


class TestNoRetryOnPermanentErrors:
    def test_auth_error_no_retry(self, mock_provider):
        mock_provider.generate_explanation.side_effect = LLMAuthError("bad key")
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 3})
        assert result["success"] is False
        assert mock_provider.generate_explanation.call_count == 1

    def test_validation_error_no_retry(self, mock_provider):
        mock_provider.generate_explanation.side_effect = LLMValidationError("invalid")
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 3})
        assert result["success"] is False
        assert mock_provider.generate_explanation.call_count == 1


class TestRetryConfig:
    def test_zero_retries_means_single_attempt(self, mock_provider):
        mock_provider.generate_explanation.side_effect = LLMTimeoutError("timeout")
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 0})
        assert result["success"] is False
        assert mock_provider.generate_explanation.call_count == 1

    def test_default_retries_is_one(self, mock_provider):
        mock_provider.generate_explanation.side_effect = LLMTimeoutError("timeout")
        result = explain_from_report(SAMPLE_REPORT)
        assert result["success"] is False
        assert mock_provider.generate_explanation.call_count == 2

    def test_successful_first_attempt_no_retry_needed(self, mock_provider):
        mock_provider.generate_explanation.return_value = "First try success"
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 3})
        assert result["success"] is True
        assert mock_provider.generate_explanation.call_count == 1


class TestExponentialBackoff:
    @patch("src.services.explain_service.time.sleep")
    def test_backoff_timing(self, mock_sleep, mock_provider):
        mock_provider.generate_explanation.side_effect = [
            LLMTimeoutError("t1"),
            LLMTimeoutError("t2"),
            LLMTimeoutError("t3"),
            "success",
        ]
        result = explain_from_report(SAMPLE_REPORT, llm_config={"max_retries": 3})
        assert result["success"] is True
        assert mock_sleep.call_count == 3
        mock_sleep.assert_any_call(1)   # 2^0
        mock_sleep.assert_any_call(2)   # 2^1
        mock_sleep.assert_any_call(4)   # 2^2
