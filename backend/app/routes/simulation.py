from __future__ import annotations

from fastapi import APIRouter

from app.services.simulation import SCENARIOS, run_simulation

router = APIRouter(prefix="/simulation", tags=["simulation"])

from pydantic import BaseModel

class SimulationParams(BaseModel):
    ev: int
    solar: int
    plastic: int

@router.get("/scenarios")
def scenarios() -> dict:
    return {"items": [{"id": key, "label": value["label"]} for key, value in SCENARIOS.items()]}

@router.post("/run")
def run(payload: SimulationParams) -> dict:
    return run_simulation(payload.ev, payload.solar, payload.plastic)
