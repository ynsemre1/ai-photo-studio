from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    database_url: str = field(
        default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./app.db")
    )
    redis_url: str = field(
        default_factory=lambda: os.getenv("REDIS_URL", "redis://localhost:6379/0")
    )

    stale_run_threshold_minutes: int = 15

    log_level: str = field(
        default_factory=lambda: os.getenv("LOG_LEVEL", "INFO")
    )

    scheduler_enabled: bool = field(
        default_factory=lambda: os.getenv("SCHEDULER_ENABLED", "true").lower() == "true"
    )


settings = Settings()
