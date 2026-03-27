import os


class Settings:
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Scheduler
    pipeline_command: str = os.getenv("PIPELINE_COMMAND", "python -m pipeline.run")
    ingest_news_command: str = os.getenv("INGEST_NEWS_COMMAND", "python -m pipeline.ingest_news")

    # Pipeline stdio capture
    pipeline_stdio_tail_lines: int = int(os.getenv("PIPELINE_STDIO_TAIL_LINES", "20"))

    # Cron expressions
    pipeline_cron_hour: str = os.getenv("PIPELINE_CRON_HOUR", "*/4")
    ingest_news_cron_hour: str = os.getenv("INGEST_NEWS_CRON_HOUR", "*/6")

    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///jobs.db")


settings = Settings()
