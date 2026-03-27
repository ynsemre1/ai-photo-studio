from src.services.llm_providers.base import BaseLLMProvider


def create_llm_provider(provider_name: str) -> BaseLLMProvider:
    raise NotImplementedError(f"Provider '{provider_name}' is not implemented yet")
