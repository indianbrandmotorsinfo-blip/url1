"""Data access for the `urls` table."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import UrlEntry
from app.schemas import UrlPayload


def list_all(db: Session) -> list[UrlEntry]:
    statement = select(UrlEntry).order_by(func.lower(UrlEntry.name), UrlEntry.id)
    return list(db.scalars(statement))


def get(db: Session, url_id: int) -> UrlEntry | None:
    return db.get(UrlEntry, url_id)


def create(db: Session, payload: UrlPayload) -> UrlEntry:
    entry = UrlEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    return entry


def update(db: Session, entry: UrlEntry, payload: UrlPayload) -> UrlEntry:
    entry.name = payload.name
    entry.url = payload.url
    entry.description = payload.description
    db.commit()
    return entry


def delete(db: Session, entry: UrlEntry) -> None:
    db.delete(entry)
    db.commit()
