"""Pytest fixtures and configuration for JAL-RAKSHAK backend test suite."""
import os
import sys
import pytest

# Ensure all modules are on sys.path
TESTS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(TESTS_DIR, ".."))
ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

for p in [BACKEND_DIR, os.path.join(ROOT_DIR, "ai-engine"), os.path.join(ROOT_DIR, "iot-simulator")]:
    if p not in sys.path:
        sys.path.insert(0, p)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.database.seed import seed_database
from app.database.session import SessionLocal

@pytest.fixture(scope="session")
def db_session():
    """Provides an initialized and seeded database session for tests."""
    from app.database.session import init_db
    init_db()
    seed_database()
    db = SessionLocal()
    yield db
    db.close()
