from __future__ import annotations

from fastapi import APIRouter, Depends

from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/leaderboard")
def leaderboard(current_user: dict = Depends(get_current_user)) -> dict:
    with get_db() as db:
        rows = db.execute("SELECT * FROM community_groups ORDER BY rank ASC").fetchall()
        return {"groups": [dict(row) for row in rows]}
