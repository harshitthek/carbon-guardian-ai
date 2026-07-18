import sys
from pathlib import Path

# Add the backend directory to sys.path so we can import app modules
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models import User, UserActivity, EmissionsLog, Reward, CommunityGroup
from app.services.auth import get_password_hash


def seed_db():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            print("Database already seeded. Skipping.")
            return

        hashed = get_password_hash("password123")
        admin = User(
            name="Aarav",
            email="aarav@carbonguardian.ai",
            password_hash=hashed,
            role="admin",
            level=7,
            persona="Eco Warrior",
            green_points=2450,
            location="Delhi",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        activities = [
            UserActivity(user_id=admin.id, action="commute", transport_mode="cab", electricity_kwh=2.4, waste_kg=0.2, time_of_day=9, location_aqi=132, weather_temp=33),
            UserActivity(user_id=admin.id, action="commute", transport_mode="metro", electricity_kwh=2.1, waste_kg=0.1, time_of_day=10, location_aqi=118, weather_temp=32),
            UserActivity(user_id=admin.id, action="food", transport_mode="walk", electricity_kwh=1.6, waste_kg=0.4, time_of_day=13, location_aqi=124, weather_temp=34),
            UserActivity(user_id=admin.id, action="commute", transport_mode="cab", electricity_kwh=3.1, waste_kg=0.2, time_of_day=17, location_aqi=145, weather_temp=31),
            UserActivity(user_id=admin.id, action="errand", transport_mode="cycling", electricity_kwh=1.2, waste_kg=0.1, time_of_day=18, location_aqi=152, weather_temp=30),
            UserActivity(user_id=admin.id, action="commute", transport_mode="cab", electricity_kwh=2.8, waste_kg=0.2, time_of_day=17, location_aqi=138, weather_temp=31),
            UserActivity(user_id=admin.id, action="home_energy", transport_mode="none", electricity_kwh=4.6, waste_kg=0.3, time_of_day=20, location_aqi=126, weather_temp=29),
            UserActivity(user_id=admin.id, action="commute", transport_mode="metro", electricity_kwh=2.0, waste_kg=0.1, time_of_day=17, location_aqi=141, weather_temp=31),
        ]
        db.add_all(activities)

        emissions = [
            EmissionsLog(user_id=admin.id, transport_kg=14.1, electricity_kg=3.9, waste_kg=1.4, total_kg=19.4),
            EmissionsLog(user_id=admin.id, transport_kg=8.6, electricity_kg=3.2, waste_kg=1.2, total_kg=13.0),
            EmissionsLog(user_id=admin.id, transport_kg=12.4, electricity_kg=3.6, waste_kg=1.2, total_kg=17.2),
        ]
        db.add_all(emissions)

        rewards = [
            Reward(user_id=admin.id, source="Used Metro", points=50),
            Reward(user_id=admin.id, source="Switched to LED", points=30),
            Reward(user_id=admin.id, source="Avoided Plastic", points=40),
            Reward(user_id=admin.id, source="Cycling", points=60),
        ]
        db.add_all(rewards)

        community = [
            CommunityGroup(name="Your College Community", weekly_reduction_kg=120, rank=3, members=238),
            CommunityGroup(name="North Campus Climate Club", weekly_reduction_kg=94, rank=5, members=119),
            CommunityGroup(name="Green Delhi Riders", weekly_reduction_kg=156, rank=1, members=306),
        ]
        db.add_all(community)

        db.commit()
        print("Database seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
