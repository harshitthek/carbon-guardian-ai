from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user

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
def profile(current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user["id"]
    with get_db() as db:
        user = dict(db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone())
        rewards = db.execute(
            "SELECT id, source, points, created_at as date FROM rewards WHERE user_id = ? ORDER BY created_at DESC LIMIT 6",
            (user_id,),
        ).fetchall()
        emissions = db.execute(
            "SELECT SUM(transport_kg) as t, SUM(electricity_kg) as e, SUM(waste_kg) as w FROM emissions_log WHERE user_id = ?",
            (user_id,)
        ).fetchone()
        t = emissions["t"] or 0
        e = emissions["e"] or 0
        w = emissions["w"] or 0
        total = t + e + w
        
        if total > 0:
            t_pct = round((t/total)*100)
            e_pct = round((e/total)*100)
            w_pct = 100 - t_pct - e_pct
        else:
            t_pct = e_pct = w_pct = 0
        
        trend_rows = db.execute(
            """
            SELECT DATE(created_at) as day, SUM(total_kg) as co2 
            FROM emissions_log 
            WHERE user_id = ? 
              AND created_at >= date('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
            """,
            (user_id,)
        ).fetchall()
        
        weekly_trend = [{"day": row["day"][5:10], "co2": row["co2"]} for row in trend_rows]

        return {
            **user, 
            "recent_rewards": [dict(row) for row in rewards],
            "footprint_breakdown": [
                { "name": "Transport", "value": t_pct, "fill": "#10b981" },
                { "name": "Electricity", "value": e_pct, "fill": "#3b82f6" },
                { "name": "Waste", "value": w_pct, "fill": "#ef4444" }
            ],
            "weekly_trend": weekly_trend
        }


@router.get("/activity")
def activity(current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user["id"]
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            (user_id,),
        ).fetchall()
        return {"items": [dict(row) for row in rows]}


@router.post("/activity")
def add_activity(payload: ActivityIn, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user["id"]
    with get_db() as db:
        db.execute(
            """
            INSERT INTO user_activity
            (user_id, action, transport_mode, electricity_kwh, waste_kg, time_of_day, location_aqi, weather_temp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
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
