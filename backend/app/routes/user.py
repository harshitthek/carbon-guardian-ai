from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List

from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UserActivity, EmissionsLog, Reward

router = APIRouter(prefix="/user", tags=["user"])


class ActivityIn(BaseModel):
    """Payload for submitting a new user activity."""
    action: str = Field(..., description="Type of action, e.g., 'commute', 'appliance'")
    transport_mode: str = Field("none", description="Mode of transport if applicable")
    electricity_kwh: float = Field(0, description="Electricity usage in kWh", ge=0)
    waste_kg: float = Field(0, description="Waste generated in kg", ge=0)
    time_of_day: int = Field(..., description="Hour of the day (0-23)", ge=0, le=23)
    location_aqi: int = Field(..., description="Current Air Quality Index", ge=0)
    weather_temp: float = Field(..., description="Current temperature in Celsius")

class RewardOut(BaseModel):
    id: int
    source: str
    points: int
    date: datetime

class FootprintBreakdown(BaseModel):
    name: str
    value: float
    fill: str

class WeeklyTrend(BaseModel):
    day: str
    co2: float

class ProfileOut(BaseModel):
    id: int = Field(..., description="User ID")
    name: str = Field(..., description="User's full name")
    email: str = Field(..., description="User's email address")
    level: int = Field(..., description="Gamification level")
    persona: str = Field(..., description="User's eco-persona title")
    role: str = Field(..., description="User role (e.g. admin, user)")
    green_points: int = Field(..., description="Total accumulated Green Points")
    location: str | None = Field(None, description="User's city or location")
    recent_rewards: List[RewardOut] = Field(..., description="Last 6 rewards earned")
    footprint_breakdown: List[FootprintBreakdown] = Field(..., description="Pie chart data for footprint")
    weekly_trend: List[WeeklyTrend] = Field(..., description="Bar chart data for past 7 days of emissions")

class ActivityItem(BaseModel):
    id: int
    action: str
    transport_mode: str
    electricity_kwh: float
    waste_kg: float
    time_of_day: int
    location_aqi: int
    weather_temp: float
    created_at: datetime

class ActivityLogOut(BaseModel):
    items: List[ActivityItem]

class ActivityResponse(BaseModel):
    status: str


@router.get("/profile", response_model=ProfileOut, summary="Get User Profile")
def profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve the authenticated user's profile, footprint breakdown, and recent rewards."""
    user_id = current_user.id
    user_dict = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "level": current_user.level,
        "persona": current_user.persona,
        "role": current_user.role,
        "green_points": current_user.green_points,
        "location": current_user.location,
    }
    rewards = db.query(Reward.id, Reward.source, Reward.points, Reward.created_at.label("date")).filter(Reward.user_id == user_id).order_by(Reward.created_at.desc()).limit(6).all()
    emissions = db.query(
        func.sum(EmissionsLog.transport_kg).label("t"),
        func.sum(EmissionsLog.electricity_kg).label("e"),
        func.sum(EmissionsLog.waste_kg).label("w")
    ).filter(EmissionsLog.user_id == user_id).first()
    
    t = (emissions[0] if emissions else 0) or 0
    e = (emissions[1] if emissions else 0) or 0
    w = (emissions[2] if emissions else 0) or 0
    total = t + e + w
    
    if total > 0:
        t_pct = round((t/total)*100)
        e_pct = round((e/total)*100)
        w_pct = 100 - t_pct - e_pct
    else:
        t_pct = e_pct = w_pct = 0
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    trend_rows = db.query(
        func.date(EmissionsLog.created_at).label("day"),
        func.sum(EmissionsLog.total_kg).label("co2")
    ).filter(
        EmissionsLog.user_id == user_id,
        EmissionsLog.created_at >= seven_days_ago
    ).group_by(
        func.date(EmissionsLog.created_at)
    ).order_by(
        func.date(EmissionsLog.created_at).asc()
    ).all()
    
    weekly_trend = [{"day": str(row.day)[5:10], "co2": row.co2} for row in trend_rows]

    return {
        **user_dict, 
        "recent_rewards": [{"id": r.id, "source": r.source, "points": r.points, "date": r.date} for r in rewards],
        "footprint_breakdown": [
            { "name": "Transport", "value": t_pct, "fill": "#10b981" },
            { "name": "Electricity", "value": e_pct, "fill": "#3b82f6" },
            { "name": "Waste", "value": w_pct, "fill": "#ef4444" }
        ],
        "weekly_trend": weekly_trend
    }


@router.get("/activity", response_model=ActivityLogOut, summary="Get User Activity Log")
def activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch the recent activity log for the current authenticated user."""
    user_id = current_user.id
    rows = db.query(UserActivity).filter(UserActivity.user_id == user_id).order_by(UserActivity.created_at.desc()).limit(20).all()
    return {"items": [{
        "id": row.id,
        "action": row.action,
        "transport_mode": row.transport_mode,
        "electricity_kwh": row.electricity_kwh,
        "waste_kg": row.waste_kg,
        "time_of_day": row.time_of_day,
        "location_aqi": row.location_aqi,
        "weather_temp": row.weather_temp,
        "created_at": row.created_at
    } for row in rows]}


@router.post("/activity", response_model=ActivityResponse, summary="Record User Activity")
def add_activity(payload: ActivityIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Record a new eco-activity for the current user and evaluate points/emissions."""
    user_id = current_user.id
    activity = UserActivity(
        user_id=user_id,
        action=payload.action,
        transport_mode=payload.transport_mode,
        electricity_kwh=payload.electricity_kwh,
        waste_kg=payload.waste_kg,
        time_of_day=payload.time_of_day,
        location_aqi=payload.location_aqi,
        weather_temp=payload.weather_temp,
    )
    db.add(activity)
    db.commit()
    return {"status": "recorded"}
