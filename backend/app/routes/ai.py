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
    """Payload for requesting AI recommendations."""
    time_of_day: int
    location_aqi: int
    weather_temp: float


class FeedbackIn(BaseModel):
    """Payload for providing feedback on AI recommendations."""
    recommendation_id: int
    accepted: bool
    action_taken: str


@router.post("/recommend")
def recommend(payload: RecommendIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Generate a personalized eco-friendly transport recommendation."""
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
    """Submit user feedback for a given recommendation and reward points if accepted."""
    user_id = current_user.id
    points = points_for_action(payload.action_taken) if payload.accepted else 0
    if payload.accepted:
        updated_count = db.query(Recommendation).filter(
            Recommendation.id == payload.recommendation_id, 
            Recommendation.user_id == user_id, 
            Recommendation.accepted == 0
        ).update({"accepted": 1})
        
        if updated_count > 0 and points:
            reward = Reward(
                user_id=user_id, 
                source=payload.action_taken, 
                points=points,
                recommendation_id=payload.recommendation_id
            )
            db.add(reward)
            current_user.green_points += points
            db.commit()
        else:
            points = 0
            db.rollback()
    else:
        # Rejection path: do not reset accepted to 0, treat as no-op.
        points = 0
    return {"accepted": payload.accepted, "points_awarded": points, "retrain_signal": payload.accepted}


@router.post("/retrain")
def retrain(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Trigger retraining of the AI recommendation engine."""
    user_id = current_user.id
    accepted = db.query(Recommendation).filter(Recommendation.user_id == user_id, Recommendation.accepted == 1).count()
    history = db.query(UserActivity).filter(UserActivity.user_id == user_id).count()
    return {
        "status": "scheduled",
        "model": "tensorflow-recommenders-ranking",
        "training_examples": history,
        "positive_feedback_examples": accepted,
    }
