from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.simulation import SCENARIOS, run_simulation
from app.dependencies import get_current_user

router = APIRouter(prefix="/simulation", tags=["simulation"])

class SimulationParams(BaseModel):
    ev: int = Field(ge=0, le=100)
    solar: int = Field(ge=0, le=100)
    plastic: int = Field(ge=0, le=100)

@router.get("/scenarios")
def scenarios(current_user: dict = Depends(get_current_user)) -> dict:
    return {"items": [{"id": key, "label": value["label"]} for key, value in SCENARIOS.items()]}

@router.post("/run")
def run(payload: SimulationParams, current_user: dict = Depends(get_current_user)) -> dict:
    return run_simulation(payload.ev, payload.solar, payload.plastic)
