from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.api.models import AdminCreateUserRequest, AdminUpdateUserRequest


class TestAdminCreateUserRequestRoleValidation:
    def test_valid_role_user(self):
        req = AdminCreateUserRequest(
            email="test@example.com",
            password="securepass123",
            display_name="Test User",
            role="user",
        )
        assert req.role == "user"

    def test_valid_role_admin(self):
        req = AdminCreateUserRequest(
            email="test@example.com",
            password="securepass123",
            display_name="Test User",
            role="admin",
        )
        assert req.role == "admin"

    def test_default_role_is_user(self):
        req = AdminCreateUserRequest(
            email="test@example.com",
            password="securepass123",
            display_name="Test User",
        )
        assert req.role == "user"

    def test_invalid_role_superadmin(self):
        with pytest.raises(ValidationError):
            AdminCreateUserRequest(
                email="test@example.com",
                password="securepass123",
                display_name="Test User",
                role="superadmin",
            )

    def test_invalid_role_root(self):
        with pytest.raises(ValidationError):
            AdminCreateUserRequest(
                email="test@example.com",
                password="securepass123",
                display_name="Test User",
                role="root",
            )

    def test_invalid_role_empty_string(self):
        with pytest.raises(ValidationError):
            AdminCreateUserRequest(
                email="test@example.com",
                password="securepass123",
                display_name="Test User",
                role="",
            )

    def test_valid_plan_free(self):
        req = AdminCreateUserRequest(
            email="test@example.com",
            password="securepass123",
            display_name="Test User",
            plan="free",
        )
        assert req.plan == "free"

    def test_valid_plan_pro(self):
        req = AdminCreateUserRequest(
            email="test@example.com",
            password="securepass123",
            display_name="Test User",
            plan="pro",
        )
        assert req.plan == "pro"

    def test_invalid_plan(self):
        with pytest.raises(ValidationError):
            AdminCreateUserRequest(
                email="test@example.com",
                password="securepass123",
                display_name="Test User",
                plan="enterprise",
            )


class TestAdminUpdateUserRequestRoleValidation:
    def test_valid_role_user(self):
        req = AdminUpdateUserRequest(role="user")
        assert req.role == "user"

    def test_valid_role_admin(self):
        req = AdminUpdateUserRequest(role="admin")
        assert req.role == "admin"

    def test_role_none_by_default(self):
        req = AdminUpdateUserRequest()
        assert req.role is None

    def test_invalid_role_superadmin(self):
        with pytest.raises(ValidationError):
            AdminUpdateUserRequest(role="superadmin")

    def test_invalid_role_root(self):
        with pytest.raises(ValidationError):
            AdminUpdateUserRequest(role="root")

    def test_invalid_role_moderator(self):
        with pytest.raises(ValidationError):
            AdminUpdateUserRequest(role="moderator")

    def test_invalid_role_empty_string(self):
        with pytest.raises(ValidationError):
            AdminUpdateUserRequest(role="")

    def test_valid_plan_update(self):
        req = AdminUpdateUserRequest(plan="pro")
        assert req.plan == "pro"

    def test_invalid_plan_update(self):
        with pytest.raises(ValidationError):
            AdminUpdateUserRequest(plan="enterprise")

    def test_all_fields_none(self):
        req = AdminUpdateUserRequest()
        assert req.role is None
        assert req.plan is None
        assert req.email is None
        assert req.display_name is None
        assert req.is_active is None

    def test_partial_update_role_only(self):
        req = AdminUpdateUserRequest(role="admin")
        assert req.role == "admin"
        assert req.plan is None

    def test_partial_update_plan_only(self):
        req = AdminUpdateUserRequest(plan="free")
        assert req.plan == "free"
        assert req.role is None
