from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Fallback to local SQLite if DATABASE_URL is not provided
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///carbon_guardian.db")

# connect_args={"check_same_thread": False} is required for SQLite in FastAPI
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Iterator[Session]:
    """Yield a database session for use in FastAPI dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
