from __future__ import annotations

import abc
from typing import Any


class BaseLLMProvider(abc.ABC):
    """Abstract base class that every LLM provider must implement."""

    @abc.abstractmethod
    def generate_explanation(
        self,
        *,
        system_prompt: str,
        payload: dict[str, Any],
        model: str,
        timeout: int,
        temperature: float,
    ) -> str:
        """Send a prompt to the LLM and return the generated text."""


_REGISTRY: dict[str, type[BaseLLMProvider]] = {}


def register_provider(name: str, cls: type[BaseLLMProvider]) -> None:
    _REGISTRY[name] = cls


def create_llm_provider(provider_name: str) -> BaseLLMProvider:
    cls = _REGISTRY.get(provider_name)
    if cls is None:
        raise ValueError(f"Unknown LLM provider: {provider_name}")
    return cls()
