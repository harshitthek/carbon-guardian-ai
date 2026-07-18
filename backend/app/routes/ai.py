from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Recommendation, Reward, UserActivity
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
def recommend(payload: RecommendIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    user_id = current_user.id
    result = RecommendationEngine(db).recommend(
        user_id,
        payload.time_of_day,
        payload.location_aqi,
        payload.weather_temp,
    )
    rec = Recommendation(
        user_id=user_id,
        prediction=result.prediction,
        recommendation_text=result.recommendation,
        impact_percent=result.impact_percent,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {**result.__dict__, "id": rec.id}


@router.post("/feedback")
def feedback(payload: FeedbackIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    user_id = current_user.id
    points = points_for_action(payload.action_taken) if payload.accepted else 0
    if payload.accepted:
        rec = db.query(Recommendation).filter(Recommendation.id == payload.recommendation_id, Recommendation.user_id == user_id, Recommendation.accepted == 0).first()
        if rec and points:
            rec.accepted = 1
            reward = Reward(user_id=user_id, source=payload.action_taken, points=points)
            db.add(reward)
            current_user.green_points += points
            db.commit()
        else:
            points = 0
    else:
        rec = db.query(Recommendation).filter(Recommendation.id == payload.recommendation_id, Recommendation.user_id == user_id).first()
        if rec:
            rec.accepted = 0
            db.commit()
        points = 0
    return {"accepted": payload.accepted, "points_awarded": points, "retrain_signal": payload.accepted}


@router.post("/retrain")
def retrain(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    user_id = current_user.id
    accepted = db.query(Recommendation).filter(Recommendation.user_id == user_id, Recommendation.accepted == 1).count()
    history = db.query(UserActivity).filter(UserActivity.user_id == user_id).count()
    return {
        "status": "scheduled",
        "model": "tensorflow-recommenders-ranking",
        "training_examples": history,
        "positive_feedback_examples": accepted,
    }
