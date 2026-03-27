from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


# ──────────────────────────────────────────────
# Response models
# ──────────────────────────────────────────────


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    role: str
    plan: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    per_page: int


class MessageResponse(BaseModel):
    message: str


# ──────────────────────────────────────────────
# Admin request models
# ──────────────────────────────────────────────


class AdminCreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1, max_length=100)
    role: Literal["user", "admin"] = "user"
    plan: Literal["free", "pro"] = "free"


class AdminUpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = None
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    role: Literal["user", "admin"] | None = None
    plan: Literal["free", "pro"] | None = None
    is_active: Optional[bool] = None
