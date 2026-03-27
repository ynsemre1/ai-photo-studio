"""Statistical confidence calculation from setup journal trade data.

Computes expectancy-based confidence scores using realized win/loss
magnitudes from the setup_journal table.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from sqlalchemy import text
from sqlalchemy.engine import Connection


# ---------------------------------------------------------------------------
# Expectancy helpers
# ---------------------------------------------------------------------------

def normalize_expectancy(
    expectancy: float,
    min_expectancy: float = -0.04,
    max_expectancy: float = 0.04,
) -> float:
    """Map a raw expectancy value to [0, 1].

    The wider range (vs. the previous ±0.02) accounts for real avg_loss
    values that can exceed 1.0R, which shifts the expectancy distribution.
    """
    if expectancy <= min_expectancy:
        return 0.0
    if expectancy >= max_expectancy:
        return 1.0
    return (expectancy - min_expectancy) / (max_expectancy - min_expectancy)


def calculate_expectancy(
    win_rate: float,
    avg_win: float,
    avg_loss: float,
) -> float:
    """Return expectancy in R-multiples.

    expectancy = win_rate * avg_win - (1 - win_rate) * avg_loss
    """
    return win_rate * avg_win - (1.0 - win_rate) * avg_loss


# ---------------------------------------------------------------------------
# Data container
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class StatisticalConfidenceDetails:
    total_count: int
    win_count: int
    loss_count: int
    win_rate: float
    avg_win: float
    avg_loss: float
    expectancy: float
    confidence_score: float


# ---------------------------------------------------------------------------
# Main query
# ---------------------------------------------------------------------------

_JOURNAL_QUERY = text("""
    SELECT
        COUNT(*) AS total_count,
        COALESCE(SUM(CASE WHEN outcome = 'WIN' THEN 1 ELSE 0 END), 0) AS win_count,
        COALESCE(SUM(CASE WHEN outcome IN ('LOSS', 'EXPIRED') THEN 1 ELSE 0 END), 0) AS loss_count,
        COALESCE(AVG(CASE WHEN outcome = 'WIN' THEN rr END), 0.0) AS avg_win,
        -- Use realized loss magnitude when available; fall back to 1.0R for
        -- legacy rows where realized_loss_rr was not yet tracked.
        COALESCE(
            AVG(CASE WHEN outcome IN ('LOSS', 'EXPIRED') THEN
                COALESCE(realized_loss_rr, 1.0)
            END),
            0.0
        ) AS avg_loss
    FROM setup_journal
    WHERE setup_type = :setup_type
      AND ts >= NOW() - CAST(:lookback_days || ' days' AS INTERVAL)
""")


def statistical_confidence_details_from_journal(
    conn: Connection,
    setup_type: str,
    lookback_days: int = 90,
    min_expectancy: float = -0.04,
    max_expectancy: float = 0.04,
) -> Optional[StatisticalConfidenceDetails]:
    """Query setup_journal and return statistical confidence details.

    Returns ``None`` when there are no trades in the lookback window.
    """
    row = conn.execute(
        _JOURNAL_QUERY,
        {"setup_type": setup_type, "lookback_days": str(lookback_days)},
    ).mappings().first()

    if row is None or row["total_count"] == 0:
        return None

    total_count: int = row["total_count"]
    win_count: int = row["win_count"]
    loss_count: int = row["loss_count"]
    avg_win: float = float(row["avg_win"])
    avg_loss: float = float(row["avg_loss"])

    win_rate = win_count / total_count if total_count > 0 else 0.0

    expectancy = calculate_expectancy(win_rate, avg_win, avg_loss)
    confidence_score = normalize_expectancy(
        expectancy,
        min_expectancy=min_expectancy,
        max_expectancy=max_expectancy,
    )

    return StatisticalConfidenceDetails(
        total_count=total_count,
        win_count=win_count,
        loss_count=loss_count,
        win_rate=win_rate,
        avg_win=avg_win,
        avg_loss=avg_loss,
        expectancy=expectancy,
        confidence_score=confidence_score,
    )
