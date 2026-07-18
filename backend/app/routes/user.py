from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UserActivity, EmissionsLog, Reward

router = APIRouter(prefix="/user", tags=["user"])


class ActivityIn(BaseModel):
    """Payload for submitting a new user activity."""
    user_id: int = 1
    action: str
    transport_mode: str = "none"
    electricity_kwh: float = 0
    waste_kg: float = 0
    time_of_day: int
    location_aqi: int
    weather_temp: float


@router.get("/profile")
def profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Retrieve the user's profile, footprint breakdown, and recent rewards."""
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
    t = emissions.t or 0
    e = emissions.e or 0
    w = emissions.w or 0
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


@router.get("/activity")
def activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Fetch the recent activity log for the current user."""
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


@router.post("/activity")
def add_activity(payload: ActivityIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Record a new activity for the current user."""
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
