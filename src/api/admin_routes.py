from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.api.models import (
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    MessageResponse,
    UserListResponse,
    UserResponse,
)
from src.auth.dependencies import CurrentUser, require_admin
from src.db.session import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


# ──────────────────────────────────────────────
# List / Get endpoints
# ──────────────────────────────────────────────


@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    plan: Optional[str] = None,
    is_active: Optional[bool] = None,
    admin: CurrentUser = Depends(require_admin),
    db=Depends(get_db),
):
    conditions = []
    params: list = []
    idx = 1

    if role is not None:
        conditions.append(f"role = ${idx}")
        params.append(role)
        idx += 1
    if plan is not None:
        conditions.append(f"plan = ${idx}")
        params.append(plan)
        idx += 1
    if is_active is not None:
        conditions.append(f"is_active = ${idx}")
        params.append(is_active)
        idx += 1

    where_clause = " AND ".join(conditions) if conditions else "TRUE"

    count_query = f"SELECT COUNT(*) FROM users WHERE {where_clause}"
    total = await db.fetchval(count_query, *params)

    offset = (page - 1) * per_page
    data_query = f"""
        SELECT id, email, display_name, role, plan, is_active, created_at, updated_at
        FROM users
        WHERE {where_clause}
        ORDER BY created_at DESC
        LIMIT ${idx} OFFSET ${idx + 1}
    """
    params.extend([per_page, offset])
    rows = await db.fetch(data_query, *params)

    return UserListResponse(
        users=[UserResponse(**dict(r)) for r in rows],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    admin: CurrentUser = Depends(require_admin),
    db=Depends(get_db),
):
    row = await db.fetchrow(
        "SELECT id, email, display_name, role, plan, is_active, created_at, updated_at FROM users WHERE id = $1",
        user_id,
    )
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return UserResponse(**dict(row))


# ──────────────────────────────────────────────
# Create user
# ──────────────────────────────────────────────


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: AdminCreateUserRequest,
    admin: CurrentUser = Depends(require_admin),
    db=Depends(get_db),
):
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
        INSERT INTO users (id, email, password_hash, display_name, role, plan, is_active, created_at, updated_at)
        VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6, true, $7, $7)
        """,
        user_id,
        payload.email,
        payload.password,
        payload.display_name,
        payload.role,
        payload.plan,
        now,
    )

    return UserResponse(
        id=user_id,
        email=payload.email,
        display_name=payload.display_name,
        role=payload.role,
        plan=payload.plan,
        is_active=True,
        created_at=now,
        updated_at=now,
    )


# ──────────────────────────────────────────────
# Update user (PATCH)
# ──────────────────────────────────────────────


@router.patch("/users/{user_id}", response_model=UserResponse)
async def patch_user(
    user_id: str,
    payload: AdminUpdateUserRequest,
    admin: CurrentUser = Depends(require_admin),
    db=Depends(get_db),
):
    row = await db.fetchrow("SELECT id FROM users WHERE id = $1", user_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    updates = []
    params: list = []
    idx = 1

    if payload.email is not None:
        dup = await db.fetchrow(
            "SELECT id FROM users WHERE email = $1 AND id != $2",
            payload.email,
            user_id,
        )
        if dup:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use",
            )
        updates.append(f"email = ${idx}")
        params.append(payload.email)
        idx += 1

    if payload.display_name is not None:
        updates.append(f"display_name = ${idx}")
        params.append(payload.display_name)
        idx += 1

    if payload.role is not None:
        updates.append(f"role = ${idx}")
        params.append(payload.role)
        idx += 1

    if payload.plan is not None:
        updates.append(f"plan = ${idx}")
        params.append(payload.plan)
        idx += 1

    if payload.is_active is not None:
        updates.append(f"is_active = ${idx}")
        params.append(payload.is_active)
        idx += 1

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    now = datetime.now(timezone.utc)
    updates.append(f"updated_at = ${idx}")
    params.append(now)
    idx += 1

    params.append(user_id)
    set_clause = ", ".join(updates)
    query = f"UPDATE users SET {set_clause} WHERE id = ${idx} RETURNING id, email, display_name, role, plan, is_active, created_at, updated_at"

    updated = await db.fetchrow(query, *params)
    return UserResponse(**dict(updated))


# ──────────────────────────────────────────────
# Delete user
# ──────────────────────────────────────────────


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    admin: CurrentUser = Depends(require_admin),
    db=Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    row = await db.fetchrow("SELECT id FROM users WHERE id = $1", user_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    await db.execute("DELETE FROM users WHERE id = $1", user_id)
    return MessageResponse(message=f"User {user_id} deleted")
