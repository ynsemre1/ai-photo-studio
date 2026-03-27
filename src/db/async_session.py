"""Async database pool management for PostgreSQL via asyncpg."""

import logging
import os
from typing import Optional

import asyncpg

logger = logging.getLogger(__name__)

_async_pool: Optional[asyncpg.Pool] = None

DATABASE_URL = os.environ.get("DATABASE_URL", "")


async def get_async_pool() -> asyncpg.Pool:
    """Return the shared asyncpg connection pool, creating it lazily if needed."""
    global _async_pool
    if _async_pool is None or _async_pool._closed:
        logger.info("Creating new asyncpg connection pool")
        _async_pool = await asyncpg.create_pool(
            dsn=DATABASE_URL,
            min_size=2,
            max_size=10,
            command_timeout=30,
        )
    return _async_pool


async def close_async_pool() -> None:
    """Close the shared asyncpg connection pool. Call at application shutdown."""
    global _async_pool
    if _async_pool is not None and not _async_pool._closed:
        logger.info("Closing asyncpg connection pool")
        await _async_pool.close()
        _async_pool = None
