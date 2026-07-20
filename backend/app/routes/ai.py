from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, get_current_admin_user
from app.models import User, Recommendation, Reward, UserActivity
from app.services.recommender import RecommendationEngine
from app.services.rewards import points_for_action

router = APIRouter(prefix="/ai", tags=["ai"])


class RecommendIn(BaseModel):
    """Payload for requesting AI recommendations."""
    time_of_day: int = Field(..., description="Hour of the day (0-23)", ge=0, le=23)
    location_aqi: int = Field(..., description="Current Air Quality Index", ge=0)
    weather_temp: float = Field(..., description="Current temperature in Celsius")

class RecommendOut(BaseModel):
    id: int = Field(..., description="The unique ID of the generated recommendation")
    prediction: str = Field(..., description="Predicted behavior text")
    recommendation: str = Field(..., description="Actionable eco-friendly suggestion")
    impact_percent: int = Field(..., description="Estimated emission reduction percentage")
    confidence: float = Field(..., description="Model confidence score")
    model: str = Field(..., description="The underlying ranking model used")
    latency_ms: float = Field(..., description="Latency of the model prediction in milliseconds")
    fallback_reason: str | None = Field(None, description="Reason for using fallback logic, if applicable")

class FeedbackIn(BaseModel):
    """Payload for providing feedback on AI recommendations."""
    recommendation_id: int = Field(..., description="ID of the recommendation being evaluated")
    accepted: bool = Field(..., description="Whether the user accepted the recommendation")
    action_taken: str = Field(..., description="The specific action category taken by the user")

class FeedbackOut(BaseModel):
    accepted: bool = Field(..., description="Echoes whether the feedback was positive")
    points_awarded: int = Field(..., description="Green Points granted for this action")
    retrain_signal: bool = Field(..., description="Indicates if this feedback queues model retraining")

class RetrainOut(BaseModel):
    status: str = Field(..., description="Status of the metrics report")
    model: str = Field(..., description="Name of the model being updated")
    training_examples: int = Field(..., description="Total activity rows processed")
    positive_feedback_examples: int = Field(..., description="Total accepted recommendations processed")


@router.post("/recommend", response_model=RecommendOut, summary="Get AI Recommendation")
def recommend(payload: RecommendIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Generate a personalized eco-friendly transport recommendation based on the user's past
    activities and local environment metrics (AQI, Temperature). 
    If TensorFlow Recommenders is available, it uses the deep ranking model.
    """
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


@router.post("/feedback", response_model=FeedbackOut, summary="Submit Recommendation Feedback")
def feedback(payload: FeedbackIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Submit user feedback for a given recommendation. If accepted, the user is awarded
    Green Points and the underlying system registers a positive signal for future predictions.
    """
    user_id = current_user.id
    points = points_for_action(payload.action_taken, db) if payload.accepted else 0
    retrain_queued = False
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
            retrain_queued = True
        else:
            points = 0
            db.rollback()
    else:
        # Rejection path: do not reset accepted to 0, treat as no-op.
        points = 0
    return {"accepted": payload.accepted, "points_awarded": points, "retrain_signal": retrain_queued}


@router.post("/retrain", response_model=RetrainOut, summary="Get Model Retraining Metrics")
def retrain(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """
    Fetch the latest training metrics across ALL users.
    (Actual asynchronous retraining is not yet implemented).
    """
    accepted = db.query(Recommendation).filter(
        Recommendation.accepted == 1
    ).count()
    history = db.query(UserActivity).count()
    return {
        "status": "metrics_reported",
        "model": "tensorflow-recommenders-ranking",
        "training_examples": history,
        "positive_feedback_examples": accepted,
    }

