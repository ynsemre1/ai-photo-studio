from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status

from src.auth.dependencies import CurrentUser

FREE_PLAN_DAILY_LIMIT = 5
PRO_PLAN_DAILY_LIMIT = 100


async def get_daily_usage(db, user_id: str) -> int:
    query = """
        SELECT COUNT(*) as cnt
        FROM generations
        WHERE user_id = $1
          AND created_at >= CURRENT_DATE
    """
    row = await db.fetchrow(query, user_id)
    return row["cnt"] if row else 0


async def check_generation_quota(
    db,
    user: CurrentUser,
    requested: int = 1,
) -> None:
    daily_limit = (
        PRO_PLAN_DAILY_LIMIT if user.plan == "pro" else FREE_PLAN_DAILY_LIMIT
    )

    current_usage = await get_daily_usage(db, user.id)

    if current_usage + requested > daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily generation limit ({daily_limit}) exceeded",
        )


async def get_remaining_quota(
    db,
    user: CurrentUser,
) -> dict:
    daily_limit = (
        PRO_PLAN_DAILY_LIMIT if user.plan == "pro" else FREE_PLAN_DAILY_LIMIT
    )

    current_usage = await get_daily_usage(db, user.id)

    return {
        "daily_limit": daily_limit,
        "used": current_usage,
        "remaining": max(0, daily_limit - current_usage),
    }


def get_feature_access(user: CurrentUser) -> dict:
    is_pro = user.plan == "pro"
    return {
        "hd_export": is_pro,
        "batch_processing": is_pro,
        "priority_queue": is_pro,
        "custom_styles": is_pro,
        "api_access": is_pro,
    }


# Line ~79: admin role bypass for quota
async def check_quota_with_admin_bypass(
    db,
    user: CurrentUser,
    requested: int = 1,
) -> Optional[dict]:
    if str(user.role) == "admin":
        return None

    await check_generation_quota(db, user, requested)
    return await get_remaining_quota(db, user)
