"""Admin login and session check."""

import logging

from fastapi import APIRouter, HTTPException, status

from app.dependencies import CurrentAdmin, DbSession
from app.repositories import admins
from app.schemas import AdminProfile, LoginRequest, TokenResponse
from app.security import (
    DUMMY_PASSWORD_HASH,
    create_access_token,
    verify_password,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    admin = admins.get_by_username(db, payload.username)
    password_hash = admin.password_hash if admin else DUMMY_PASSWORD_HASH
    password_ok = verify_password(payload.password, password_hash)
    if admin is None or not password_ok:
        logger.warning("Failed login attempt for username '%s'", payload.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )
    logger.info("Admin '%s' signed in", admin.username)
    return TokenResponse(access_token=create_access_token(admin.username))


@router.get("/me", response_model=AdminProfile)
def me(admin: CurrentAdmin) -> AdminProfile:
    return AdminProfile(username=admin.username)
