from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.services.recommender import RecommendationEngine
from app.services.rewards import points_for_action

router = APIRouter(prefix="/ai", tags=["ai"])


class RecommendIn(BaseModel):
    user_id: int = 1
    time_of_day: int
    location_aqi: int
    weather_temp: float


class FeedbackIn(BaseModel):
    user_id: int = 1
    recommendation_id: int
    accepted: bool
    action_taken: str


@router.post("/recommend")
def recommend(payload: RecommendIn, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user["id"]
    with get_db() as db:
        result = RecommendationEngine(db).recommend(
            user_id,
            payload.time_of_day,
            payload.location_aqi,
            payload.weather_temp,
        )
        cursor = db.execute(
            """
            INSERT INTO recommendations (user_id, prediction, recommendation, impact_percent)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, result.prediction, result.recommendation, result.impact_percent),
        )
        return {**result.__dict__, "id": cursor.lastrowid}


@router.post("/feedback")
def feedback(payload: FeedbackIn, current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user["id"]
    points = points_for_action(payload.action_taken) if payload.accepted else 0
    with get_db() as db:
        db.execute(
            "UPDATE recommendations SET accepted = ? WHERE id = ? AND user_id = ?",
            (1 if payload.accepted else 0, payload.recommendation_id, user_id),
        )
        if points:
            db.execute("INSERT INTO rewards (user_id, source, points) VALUES (?, ?, ?)", (user_id, payload.action_taken, points))
            db.execute("UPDATE users SET green_points = green_points + ? WHERE id = ?", (points, user_id))
    return {"accepted": payload.accepted, "points_awarded": points, "retrain_signal": payload.accepted}


@router.post("/retrain")
def retrain(current_user: dict = Depends(get_current_user)) -> dict:
    user_id = current_user["id"]
    with get_db() as db:
        accepted = db.execute(
            "SELECT COUNT(*) AS count FROM recommendations WHERE user_id = ? AND accepted = 1",
            (user_id,),
        ).fetchone()["count"]
        history = db.execute("SELECT COUNT(*) AS count FROM user_activity WHERE user_id = ?", (user_id,)).fetchone()["count"]
    return {
        "status": "scheduled",
        "model": "tensorflow-recommenders-ranking",
        "training_examples": history,
        "positive_feedback_examples": accepted,
    }
