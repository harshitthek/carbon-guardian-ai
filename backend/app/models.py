from datetime import datetime
from typing import List

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
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

    activities = relationship("UserActivity", back_populates="user")
    emissions = relationship("EmissionsLog", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    rewards = relationship("Reward", back_populates="user")


class UserActivity(Base):
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
    __tablename__ = "rewards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="rewards")


class CommunityGroup(Base):
    __tablename__ = "community_groups"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    weekly_reduction_kg: Mapped[float] = mapped_column(Float, nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    members: Mapped[int] = mapped_column(Integer, nullable=False)
