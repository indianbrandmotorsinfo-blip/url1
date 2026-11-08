"""Create tables and keep the single admin account in sync with the environment."""

import logging

from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import Base, SessionLocal, engine
from app.models import Admin
from app.repositories import admins
from app.security import hash_password, verify_password

logger = logging.getLogger(__name__)


def sync_admin(db: Session, settings: Settings) -> None:
    """Create the admin if missing; update username or password if .env changed."""
    admin = admins.get_single(db)
    if admin is None:
        db.add(
            Admin(
                username=settings.admin_username,
                password_hash=hash_password(settings.admin_password),
            )
        )
        db.commit()
        logger.info("Created admin account '%s'", settings.admin_username)
        return

    changed = False
    if admin.username != settings.admin_username:
        admin.username = settings.admin_username
        changed = True
    if not verify_password(settings.admin_password, admin.password_hash):
        admin.password_hash = hash_password(settings.admin_password)
        changed = True
    if changed:
        db.commit()
        logger.info("Admin credentials updated from environment")


def init_database() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        sync_admin(db, get_settings())
