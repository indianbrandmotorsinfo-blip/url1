"""Data access for the `admin` table."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Admin


def get_by_username(db: Session, username: str) -> Admin | None:
    return db.scalars(select(Admin).where(Admin.username == username)).first()


def get_single(db: Session) -> Admin | None:
    return db.scalars(select(Admin).order_by(Admin.id)).first()
