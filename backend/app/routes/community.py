from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import CommunityGroup, User, EmissionsLog

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/leaderboard")
def leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Fetch the community leaderboard rankings dynamically based on emission logs."""
    groups = db.query(CommunityGroup).all()

    leaderboard_data = []
    for g in groups:
        # Sum total_kg from EmissionsLog for all users in this group
        reduction = (
            db.query(func.sum(EmissionsLog.total_kg))
            .join(User, EmissionsLog.user_id == User.id)
            .filter(User.group_id == g.id)
            .scalar()
            or 0.0
        )

        leaderboard_data.append(
            {
                "id": g.id,
                "name": g.name,
                "weekly_reduction_kg": round(
                    float(reduction) + g.weekly_reduction_kg, 2
                ),
                "members": g.members,
            }
        )

    # Sort dynamically by reduction
    leaderboard_data.sort(key=lambda x: x["weekly_reduction_kg"], reverse=True)

    # Assign ranks
    for i, data in enumerate(leaderboard_data):
        data["rank"] = i + 1

    return {"groups": leaderboard_data}
