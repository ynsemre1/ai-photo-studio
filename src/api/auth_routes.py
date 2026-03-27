from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from src.auth.dependencies import (
    ALGORITHM,
    SECRET_KEY,
    CurrentUser,
    get_current_active_user,
)
from src.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


def _create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire, "type": "access"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _create_refresh_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# Lines ~58-63: RegisterRequest — role validation out of scope (see issue #03)
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1, max_length=100)
    role: str = "user"
    plan: str = "free"


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db=Depends(get_db)):
    existing = await db.fetchrow(
        "SELECT id FROM users WHERE email = $1", payload.email
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    await db.execute(
        """
        INSERT INTO users (id, email, password_hash, display_name, role, plan, is_active, created_at)
        VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6, true, $7)
        """,
        user_id,
        payload.email,
        payload.password,
        payload.display_name,
        payload.role,
        payload.plan,
        now,
    )

    return TokenResponse(
        access_token=_create_access_token(user_id),
        refresh_token=_create_refresh_token(user_id),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        SELECT id, password_hash
        FROM users
        WHERE email = $1 AND is_active = true
        """,
        payload.email,
    )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    valid = await db.fetchval(
        "SELECT crypt($1, $2) = $2", payload.password, row["password_hash"]
    )
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return TokenResponse(
        access_token=_create_access_token(row["id"]),
        refresh_token=_create_refresh_token(row["id"]),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest, db=Depends(get_db)):
    try:
        token_payload = jwt.decode(
            payload.refresh_token, SECRET_KEY, algorithms=[ALGORITHM]
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = token_payload.get("sub")
    row = await db.fetchrow(
        "SELECT id, is_active FROM users WHERE id = $1", user_id
    )

    if row is None or not row["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return TokenResponse(
        access_token=_create_access_token(user_id),
        refresh_token=_create_refresh_token(user_id),
    )


@router.get("/me")
async def get_me(current_user: CurrentUser = Depends(get_current_active_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "plan": current_user.plan,
        "is_active": current_user.is_active,
    }
