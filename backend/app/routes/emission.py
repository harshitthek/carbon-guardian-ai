from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database import get_db
from app.services.emissions import calculate_emission

router = APIRouter(prefix="/emission", tags=["emission"])


class EmissionIn(BaseModel):
    user_id: int = 1
    transport_mode: str
    distance_km: float
    electricity_kwh: float
    waste_kg: float


from sqlalchemy.orm import Session
from app.models import EmissionsLog

@router.post("/calculate")
def calculate(payload: EmissionIn, db: Session = Depends(get_db)) -> dict:
    result = calculate_emission(
        payload.transport_mode,
        payload.distance_km,
        payload.electricity_kwh,
        payload.waste_kg,
    )
    log = EmissionsLog(
        user_id=payload.user_id,
        transport_kg=result["transport_kg"],
        electricity_kg=result["electricity_kg"],
        waste_kg=result["waste_kg"],
        total_kg=result["total_kg"],
    )
    db.add(log)
    db.commit()
    return result
