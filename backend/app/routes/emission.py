from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.emissions import calculate_emission
from app.models import EmissionsLog, User, UserActivity
from app.dependencies import get_current_user

router = APIRouter(prefix="/emission", tags=["emission"])


class EmissionIn(BaseModel):
    """Payload for calculating emissions from an activity."""
    transport_mode: str
    distance_km: float
    electricity_kwh: float
    waste_kg: float


@router.post("/calculate")
def calculate(payload: EmissionIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Calculate and log carbon emissions for the specified activity."""
    result = calculate_emission(
        payload.transport_mode,
        payload.distance_km,
        payload.electricity_kwh,
        payload.waste_kg,
    )
    
    # Log the Activity
    activity = UserActivity(
        user_id=current_user.id,
        action="daily_logging",
        transport_mode=payload.transport_mode,
        electricity_kwh=payload.electricity_kwh,
        waste_kg=payload.waste_kg,
        time_of_day=12,
        location_aqi=100,
        weather_temp=30
    )
    db.add(activity)
    
    # Log the Emission
    log = EmissionsLog(
        user_id=current_user.id,
        transport_kg=result["transport_kg"],
        electricity_kg=result["electricity_kg"],
        waste_kg=result["waste_kg"],
        total_kg=result["total_kg"],
    )
    db.add(log)
    
    # Optional: We could give points here too if we wanted!
    # current_user.green_points += 10
    
    db.commit()
    return result
