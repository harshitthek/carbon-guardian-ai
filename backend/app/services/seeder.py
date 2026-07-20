import datetime
import secrets
from sqlalchemy.orm import Session
from app.models import User, CommunityGroup, EmissionsLog, AdminAuditLog, GamificationSetting
from app.services.auth import get_password_hash
from app.config import settings
from app.services.rewards import DEFAULT_ACTION_POINTS

def seed_database(db: Session) -> bool:
    """Seeds the database with initial users, groups, and logs."""
    # Create Community Groups
    if not db.query(CommunityGroup).first():
        groups = [
            CommunityGroup(name="Eco Innovators", weekly_reduction_kg=1200.5, rank=1, members=150),
            CommunityGroup(name="Green Tech Club", weekly_reduction_kg=950.2, rank=2, members=120),
            CommunityGroup(name="Earth Saviors", weekly_reduction_kg=800.0, rank=3, members=90),
        ]
        db.add_all(groups)
        db.commit()
        for g in groups:
            db.refresh(g)

        # Create Admin User
        admin_hashed = get_password_hash(settings.SEED_ADMIN_PASSWORD)
        admin = User(
            name="System Admin", 
            email="admin@carbonguard.com", 
            password_hash=admin_hashed, 
            role="admin", 
            level=99,
            group_id=groups[0].id
        )
        
        # Create Test User
        test_hashed = get_password_hash(secrets.token_urlsafe(16))
        user1 = User(
            name="Aarav", 
            email="aarav@example.com", 
            password_hash=test_hashed, 
            role="user", 
            level=7,
            group_id=groups[1].id
        )
        
        db.add_all([admin, user1])
        db.commit()
        db.refresh(admin)
        db.refresh(user1)

        # Add dummy emissions logs
        logs = [
            EmissionsLog(user_id=user1.id, transport_kg=12.4, electricity_kg=5.2, waste_kg=1.1, total_kg=18.7, created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)),
            EmissionsLog(user_id=user1.id, transport_kg=10.1, electricity_kg=4.8, waste_kg=0.9, total_kg=15.8, created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)),
            EmissionsLog(user_id=admin.id, transport_kg=5.0, electricity_kg=2.0, waste_kg=0.5, total_kg=7.5, created_at=datetime.datetime.utcnow()),
        ]
        db.add_all(logs)
        
        # Add default gamification settings
        gamification_settings = [
            GamificationSetting(action_name=action, points=pts)
            for action, pts in DEFAULT_ACTION_POINTS.items()
        ]
        db.add_all(gamification_settings)

        # Add dummy audit log
        audit = AdminAuditLog(
            admin_id=admin.id,
            action="SYSTEM_SEED",
            target_resource="database",
            details="Database seeded with initial dummy data via seeder."
        )
        db.add(audit)
        
        db.commit()
        return True
    return False
