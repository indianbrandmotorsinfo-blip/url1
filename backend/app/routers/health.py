"""Liveness / readiness endpoint used by Docker health checks."""

import logging

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text

from app.dependencies import DbSession

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])


@router.get("/api/health")
def health(db: DbSession) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Health check failed")
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Database unavailable") from None
    return {"status": "ok"}
