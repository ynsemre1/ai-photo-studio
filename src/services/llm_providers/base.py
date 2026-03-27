from abc import ABC, abstractmethod


class LLMProviderError(Exception):
    pass


class LLMTimeoutError(LLMProviderError):
    pass


class LLMRateLimitError(LLMProviderError):
    pass


class LLMAuthError(LLMProviderError):
    pass


class LLMValidationError(LLMProviderError):
    pass


class LLMAPIError(LLMProviderError):
    pass


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_explanation(
        self,
        system_prompt: str,
        payload: dict,
        model: str,
        timeout: int = 30,
        temperature: float = 0.3,
    ) -> str:
        pass
