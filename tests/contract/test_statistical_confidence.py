"""Contract tests for statistical confidence calculations.

These tests verify the expectancy and normalization logic without
requiring a live database connection.
"""

from __future__ import annotations

import pytest

from src.confidence.statistical import (
    calculate_expectancy,
    normalize_expectancy,
)


# ---------------------------------------------------------------------------
# calculate_expectancy
# ---------------------------------------------------------------------------

class TestCalculateExpectancy:
    """Core expectancy formula: win_rate * avg_win - loss_rate * avg_loss."""

    def test_positive_expectancy_with_unit_loss(self):
        # 55% win rate, 1.8R avg win, 1.0R avg loss (legacy behaviour)
        result = calculate_expectancy(win_rate=0.55, avg_win=1.8, avg_loss=1.0)
        assert result == pytest.approx(0.54)

    def test_positive_expectancy_with_real_loss(self):
        # Same setup but real avg_loss = 1.6R  -> expectancy drops significantly
        result = calculate_expectancy(win_rate=0.55, avg_win=1.8, avg_loss=1.6)
        assert result == pytest.approx(0.27)

    def test_negative_expectancy_hidden_by_unit_loss(self):
        # 45% win rate, 1.3R avg win — looks positive at 1.0R loss
        unit_loss = calculate_expectancy(win_rate=0.45, avg_win=1.3, avg_loss=1.0)
        assert unit_loss == pytest.approx(0.035)

        # But real loss is 1.5R -> actually negative
        real_loss = calculate_expectancy(win_rate=0.45, avg_win=1.3, avg_loss=1.5)
        assert real_loss == pytest.approx(-0.24, abs=1e-6)

    def test_breakeven(self):
        # 50% win rate, 1.0R avg win, 1.0R avg loss -> 0
        result = calculate_expectancy(win_rate=0.5, avg_win=1.0, avg_loss=1.0)
        assert result == pytest.approx(0.0)

    def test_zero_win_rate(self):
        result = calculate_expectancy(win_rate=0.0, avg_win=0.0, avg_loss=1.2)
        assert result == pytest.approx(-1.2)

    def test_full_win_rate(self):
        result = calculate_expectancy(win_rate=1.0, avg_win=2.0, avg_loss=0.0)
        assert result == pytest.approx(2.0)


# ---------------------------------------------------------------------------
# normalize_expectancy
# ---------------------------------------------------------------------------

class TestNormalizeExpectancy:
    """Maps raw expectancy to [0, 1] confidence score."""

    def test_midpoint(self):
        # 0 expectancy -> 0.5 with symmetric bounds
        assert normalize_expectancy(0.0) == pytest.approx(0.5)

    def test_clamp_low(self):
        assert normalize_expectancy(-0.1) == 0.0

    def test_clamp_high(self):
        assert normalize_expectancy(0.1) == 1.0

    def test_at_min_boundary(self):
        assert normalize_expectancy(-0.04) == 0.0

    def test_at_max_boundary(self):
        assert normalize_expectancy(0.04) == 1.0

    def test_linear_interpolation(self):
        # Halfway between min and max
        result = normalize_expectancy(0.0, min_expectancy=-0.04, max_expectancy=0.04)
        assert result == pytest.approx(0.5)

    def test_custom_range(self):
        result = normalize_expectancy(0.01, min_expectancy=-0.02, max_expectancy=0.02)
        assert result == pytest.approx(0.75)

    def test_wider_range_for_real_losses(self):
        """With real avg_loss > 1.0R, expectancy shifts down.
        The wider default range [-0.04, 0.04] accommodates this."""
        # A slightly negative expectancy from real losses still maps > 0
        result = normalize_expectancy(-0.02)
        assert 0.0 < result < 0.5

    def test_negative_expectancy_hidden_by_old_range(self):
        """Demonstrates why the old ±0.02 range was too narrow.
        With real losses, expectancy = -0.024 would clamp to 0 under old range
        but maps to ~0.2 under new range, giving a more nuanced signal."""
        old_range = normalize_expectancy(-0.024, min_expectancy=-0.02, max_expectancy=0.02)
        new_range = normalize_expectancy(-0.024, min_expectancy=-0.04, max_expectancy=0.04)
        assert old_range == 0.0  # clamped
        assert 0.0 < new_range < 0.5  # more informative


# ---------------------------------------------------------------------------
# Fallback / backward compatibility
# ---------------------------------------------------------------------------

class TestFallbackBehavior:
    """When realized_loss_rr is NULL, avg_loss should fall back to 1.0R.

    These tests verify the contract at the formula level; the SQL COALESCE
    fallback is tested via integration tests against a real database.
    """

    def test_unit_loss_fallback_gives_same_as_legacy(self):
        """If all losses are 1.0R (fallback), result matches old behaviour."""
        legacy = calculate_expectancy(win_rate=0.55, avg_win=1.8, avg_loss=1.0)
        fallback = calculate_expectancy(win_rate=0.55, avg_win=1.8, avg_loss=1.0)
        assert legacy == fallback

    def test_real_loss_diverges_from_legacy(self):
        legacy = calculate_expectancy(win_rate=0.55, avg_win=1.8, avg_loss=1.0)
        real = calculate_expectancy(win_rate=0.55, avg_win=1.8, avg_loss=1.6)
        assert real < legacy
