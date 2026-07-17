from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.database import get_db

router = APIRouter(prefix="/user", tags=["user"])


class ActivityIn(BaseModel):
    user_id: int = 1
    action: str
    transport_mode: str = "none"
    electricity_kwh: float = 0
    waste_kg: float = 0
    time_of_day: int
    location_aqi: int
    weather_temp: float


@router.get("/profile")
def profile(user_id: int = 1) -> dict:
    with get_db() as db:
        user = dict(db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
        rewards = db.execute(
            "SELECT source, points, created_at FROM rewards WHERE user_id = ? ORDER BY created_at DESC LIMIT 6",
            (user_id,),
        ).fetchall()
        return {
            **user, 
            "recent_rewards": [dict(row) for row in rewards],
            "footprint_breakdown": [
                { "name": "Transport", "value": 45, "fill": "#10b981" },
                { "name": "Electricity", "value": 30, "fill": "#3b82f6" },
                { "name": "Food", "value": 15, "fill": "#f59e0b" },
                { "name": "Waste", "value": 10, "fill": "#ef4444" }
            ],
            "weekly_trend": [
                { "day": "Mon", "co2": 14.2 },
                { "day": "Tue", "co2": 12.8 },
                { "day": "Wed", "co2": 15.1 },
                { "day": "Thu", "co2": 11.4 },
                { "day": "Fri", "co2": 10.9 },
                { "day": "Sat", "co2": 9.5 },
                { "day": "Sun", "co2": 8.2 }
            ]
        }


@router.get("/activity")
def activity(user_id: int = 1) -> dict:
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            (user_id,),
        ).fetchall()
        return {"items": [dict(row) for row in rows]}


@router.post("/activity")
def add_activity(payload: ActivityIn) -> dict:
    with get_db() as db:
        db.execute(
            """
            INSERT INTO user_activity
            (user_id, action, transport_mode, electricity_kwh, waste_kg, time_of_day, location_aqi, weather_temp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.user_id,
                payload.action,
                payload.transport_mode,
                payload.electricity_kwh,
                payload.waste_kg,
                payload.time_of_day,
                payload.location_aqi,
                payload.weather_temp,
            ),
        )
    return {"status": "recorded"}
