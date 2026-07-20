from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""
    pass


class User(Base):
    """Represents a user in the Carbon Guardian AI system."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, default="user", nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    persona: Mapped[str] = mapped_column(String, default="Eco Warrior", nullable=False)
    green_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    location: Mapped[str] = mapped_column(String, default="Delhi", nullable=False)
    group_id: Mapped[int | None] = mapped_column(ForeignKey("community_groups.id"), nullable=True)

    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")
    emissions = relationship("EmissionsLog", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    rewards = relationship("Reward", back_populates="user", cascade="all, delete-orphan")
    group = relationship("CommunityGroup", back_populates="users")

class UserActivity(Base):
    """Logs individual activities performed by users."""
    __tablename__ = "user_activity"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    transport_mode: Mapped[str] = mapped_column(String, nullable=True)
    electricity_kwh: Mapped[float] = mapped_column(Float, default=0.0)
    waste_kg: Mapped[float] = mapped_column(Float, default=0.0)
    time_of_day: Mapped[int] = mapped_column(Integer, nullable=False)
    location_aqi: Mapped[int] = mapped_column(Integer, nullable=False)
    weather_temp: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="activities")


class EmissionsLog(Base):
    """Records calculated carbon emissions for a given user activity."""
    __tablename__ = "emissions_log"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    transport_kg: Mapped[float] = mapped_column(Float, nullable=False)
    electricity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    waste_kg: Mapped[float] = mapped_column(Float, nullable=False)
    total_kg: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="emissions")


class Recommendation(Base):
    """Stores AI-generated recommendations and user feedback."""
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    prediction: Mapped[str] = mapped_column(String, nullable=False)
    recommendation_text: Mapped[str] = mapped_column("recommendation", String, nullable=False)
    impact_percent: Mapped[int] = mapped_column(Integer, nullable=False)
    accepted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="recommendations")


class Reward(Base):
    """Tracks green points and rewards awarded to users."""
    __tablename__ = "rewards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recommendation_id: Mapped[int | None] = mapped_column(ForeignKey("recommendations.id"), nullable=True)
    source: Mapped[str] = mapped_column(String, nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="rewards")


class CommunityGroup(Base):
    """Represents a community group for leaderboard rankings."""
    __tablename__ = "community_groups"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    weekly_reduction_kg: Mapped[float] = mapped_column(Float, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    members: Mapped[int] = mapped_column(Integer, nullable=False)
    
    users = relationship("User", back_populates="group")


class AdminAuditLog(Base):
    """Tracks administrative actions taken by users with the admin role."""
    __tablename__ = "admin_audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    target_resource: Mapped[str] = mapped_column(String, nullable=False)
    target_id: Mapped[str | None] = mapped_column(String, nullable=True)
    details: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    admin = relationship("User", foreign_keys=[admin_id])

class GamificationSetting(Base):
    """Configurable reward points for different actions."""
    __tablename__ = "gamification_settings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    action_name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
