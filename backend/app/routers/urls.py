"""URL listing (public) and management (admin only)."""

import logging

from fastapi import APIRouter, HTTPException, Response, status

from app.dependencies import CurrentAdmin, DbSession
from app.models import UrlEntry
from app.repositories import urls as repository
from app.schemas import UrlOut, UrlPayload

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/urls", tags=["urls"])


def _get_or_404(db: DbSession, url_id: int) -> UrlEntry:
    entry = repository.get(db, url_id)
    if entry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "This URL no longer exists.")
    return entry


@router.get("", response_model=list[UrlOut])
def list_urls(db: DbSession) -> list[UrlEntry]:
    return repository.list_all(db)


@router.post("", response_model=UrlOut, status_code=status.HTTP_201_CREATED)
def create_url(payload: UrlPayload, db: DbSession, admin: CurrentAdmin) -> UrlEntry:
    entry = repository.create(db, payload)
    logger.info("'%s' added URL %s ('%s')", admin.username, entry.id, entry.name)
    return entry


@router.put("/{url_id}", response_model=UrlOut)
def update_url(url_id: int, payload: UrlPayload, db: DbSession, admin: CurrentAdmin) -> UrlEntry:
    entry = repository.update(db, _get_or_404(db, url_id), payload)
    logger.info("'%s' updated URL %s", admin.username, entry.id)
    return entry


@router.delete("/{url_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_url(url_id: int, db: DbSession, admin: CurrentAdmin) -> Response:
    repository.delete(db, _get_or_404(db, url_id))
    logger.info("'%s' deleted URL %s", admin.username, url_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
