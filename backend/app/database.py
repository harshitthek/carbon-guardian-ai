from __future__ import annotations
"""database.py module."""

from typing import Iterator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings

DATABASE_URL = settings.DATABASE_URL

# connect_args={"check_same_thread": False} is required for SQLite in FastAPI
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)

if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Enable foreign key constraints for SQLite connections."""
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Iterator[Session]:
    """Yield a database session for use in FastAPI dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
