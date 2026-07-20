from __future__ import annotations

from sqlalchemy.orm import Session
from app.models import GamificationSetting

DEFAULT_ACTION_POINTS = {
    "metro": 50,
    "cycling": 60,
    "walk": 45,
    "bus": 35,
    "led": 30,
    "avoid_plastic": 40,
}


def points_for_action(action: str, db: Session) -> int:
    """Get the number of green points awarded for a specific eco-friendly action."""
    setting = db.query(GamificationSetting).filter(GamificationSetting.action_name == action.lower()).first()
    if setting:
        return setting.points
    return DEFAULT_ACTION_POINTS.get(action.lower(), 20)
