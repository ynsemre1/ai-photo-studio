class LLMProviderError(Exception):
    """Base exception for LLM provider errors."""


class LLMTimeoutError(LLMProviderError):
    """Raised when an LLM call exceeds the configured timeout."""


class LLMRateLimitError(LLMProviderError):
    """Raised when the LLM provider returns a rate-limit response."""


class LLMAuthError(LLMProviderError):
    """Raised when authentication with the LLM provider fails."""


class LLMValidationError(LLMProviderError):
    """Raised when the request payload fails provider-side validation."""


class LLMAPIError(LLMProviderError):
    """Raised for generic / unexpected LLM API errors."""
