"""PGQueuer worker — consumes jobs from the PostgreSQL queue."""

import asyncio
import logging

from pgqueuer import PgQueuer
from pgqueuer.db import AsyncpgDriver

from src.db.async_session import get_async_pool

logger = logging.getLogger(__name__)


async def create_worker() -> PgQueuer:
    """Create a PGQueuer worker that reuses the shared asyncpg pool."""
    pool = await get_async_pool()
    connection = await pool.acquire()
    driver = AsyncpgDriver(connection)
    queuer = PgQueuer(driver)
    return queuer


async def run_worker() -> None:
    """Entry point for running the PGQueuer worker process."""
    queuer = await create_worker()
    logger.info("PGQueuer worker started, listening for jobs...")
    await queuer.run()


if __name__ == "__main__":
    asyncio.run(run_worker())
