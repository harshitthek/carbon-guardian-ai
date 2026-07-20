import sys
from pathlib import Path

# Setup path for CLI imports
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal, engine
from app.models import Base
from app.services.seeder import seed_database


def run_seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding database...")
        success = seed_database(db)
        if success:
            print("Database successfully seeded.")
        else:
            print("Database already contains data. Seeding skipped.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
