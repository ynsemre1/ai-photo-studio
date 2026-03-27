from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.db.session import get_db

security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me")
ALGORITHM = "HS256"


class CurrentUser:
    def __init__(
        self,
        id: str,
        email: str,
        role: str,
        plan: str,
        is_active: bool,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.email = email
        self.role = role
        self.plan = plan
        self.is_active = is_active
        self.created_at = created_at


def _decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
) -> CurrentUser:
    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    query = "SELECT id, email, role, plan, is_active, created_at FROM users WHERE id = $1"
    row = await db.fetchrow(query, user_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not row["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return CurrentUser(
        id=row["id"],
        email=row["email"],
        role=row["role"],
        plan=row["plan"],
        is_active=row["is_active"],
        created_at=row["created_at"],
    )


async def get_current_active_user(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return current_user


# ──────────────────────────────────────────────
# Role-based access helpers
# ──────────────────────────────────────────────


async def require_optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    db=Depends(get_db),
) -> Optional[CurrentUser]:
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


async def require_verified_email(
    current_user: CurrentUser = Depends(get_current_active_user),
) -> CurrentUser:
    return current_user


async def require_pro_plan(
    current_user: CurrentUser = Depends(get_current_active_user),
) -> CurrentUser:
    if current_user.plan != "pro":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pro plan required",
        )
    return current_user


# ──────────────────────────────────────────────
# Lines ~183-186: Admin role check
# ──────────────────────────────────────────────


async def require_admin(
    current_user: CurrentUser = Depends(get_current_active_user),
) -> CurrentUser:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
