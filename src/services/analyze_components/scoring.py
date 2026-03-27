"""Scoring helpers that compose various confidence signals."""

from __future__ import annotations

from typing import Optional

from sqlalchemy.engine import Connection

from src.confidence.statistical import (
    StatisticalConfidenceDetails,
    statistical_confidence_details_from_journal,
)


def statistical_confidence_from_journal(
    conn: Connection,
    setup_type: str,
    lookback_days: int = 90,
) -> Optional[StatisticalConfidenceDetails]:
    """Thin wrapper exposing statistical confidence to the scoring pipeline."""
    return statistical_confidence_details_from_journal(
        conn,
        setup_type=setup_type,
        lookback_days=lookback_days,
    )
