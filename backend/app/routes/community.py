"""Community router module."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

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
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    # Calculate reductions for all groups in one query for the last 7 days
    reductions = (
        db.query(User.group_id, func.sum(EmissionsLog.total_kg))
        .join(EmissionsLog, EmissionsLog.user_id == User.id)
        .filter(EmissionsLog.created_at >= seven_days_ago)
        .group_by(User.group_id)
        .all()
    )
    reduction_map = {group_id: total_kg or 0.0 for group_id, total_kg in reductions}

    groups = db.query(CommunityGroup).all()

    leaderboard_data = []
    for g in groups:
        reduction = reduction_map.get(g.id, 0.0)

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
