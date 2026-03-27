from __future__ import annotations

import os
from typing import AsyncGenerator

import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/ai_photo_studio")

_pool: asyncpg.Pool | None = None


async def init_db() -> None:
    global _pool
    _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)


async def close_db() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Call init_db() first.")
    async with _pool.acquire() as conn:
        yield conn
