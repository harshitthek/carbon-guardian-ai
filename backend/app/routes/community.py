from __future__ import annotations

from fastapi import APIRouter, Depends

from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/community", tags=["community"])


from sqlalchemy.orm import Session
from app.models import CommunityGroup, User

@router.get("/leaderboard")
def leaderboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Fetch the community leaderboard rankings."""
    rows = db.query(CommunityGroup).order_by(CommunityGroup.rank.asc()).all()
    return {"groups": [{
        "id": row.id,
        "name": row.name,
        "weekly_reduction_kg": row.weekly_reduction_kg,
        "rank": row.rank,
        "members": row.members
    } for row in rows]}
