from __future__ import annotations
"""recommender.py module."""

from collections import Counter, defaultdict
from dataclasses import dataclass
import logging
import time

from sqlalchemy.orm import Session
from app.models import UserActivity

from app.services.emissions import reduction_percent


ECO_ALTERNATIVES = {
    "cab": "metro",
    "car": "metro",
    "bus": "metro",
    "metro": "cycling",
    "cycling": "walk",
    "walk": "walk",
    "none": "metro",
}

logger = logging.getLogger(__name__)


@dataclass
class RecommendationResult:
    """Dataclass holding the result of a personalized recommendation."""
    prediction: str
    recommendation: str
    impact_percent: int
    confidence: float
    model: str
    latency_ms: float
    fallback_reason: str | None = None


class BehaviorRankingModel:
    """Fallback ranking model based on user activity frequencies."""
    def __init__(self, rows: list[dict]) -> None:
        """Initialize the model with a user's activity history."""
        self.hour_mode_counts: dict[int, Counter[str]] = defaultdict(Counter)
        self.global_counts: Counter[str] = Counter()
        self.feedback_boosts: Counter[str] = Counter()
        for row in rows:
            mode = row["transport_mode"] or "none"
            hour_bucket = int(row["time_of_day"]) // 3
            self.hour_mode_counts[hour_bucket][mode] += 1
            self.global_counts[mode] += 1

    def predict_mode(self, hour: int) -> tuple[str, float]:
        """Predict the user's likely transport mode for a given hour."""
        bucket = hour // 3
        counts = self.hour_mode_counts.get(bucket) or self.global_counts
        if not counts:
            return "car", 0.42
        total = sum(counts.values())
        mode, count = counts.most_common(1)[0]
        return mode, round(count / total, 2)

    def best_alternative(self, predicted_mode: str, aqi: int, weather_temp: float) -> str:
        """Suggest an eco-friendly alternative based on predicted mode and weather."""
        if predicted_mode in {"cab", "car"} and aqi >= 110:
            return "metro"
        if weather_temp <= 31 and predicted_mode in {"metro", "bus"}:
            return "cycling"
        return ECO_ALTERNATIVES.get(predicted_mode, "metro")


class RecommendationEngine:
    """Orchestrates generating recommendations using TFRS or the fallback model."""
    def __init__(self, db: Session) -> None:
        """Initialize the RecommendationEngine with a database session."""
        self.db = db

    def recommend(self, user_id: int, time_of_day: int, location_aqi: int, weather_temp: float) -> RecommendationResult:
        """Generate a personalized recommendation for the user's next action."""
        activities = self.db.query(UserActivity).filter(UserActivity.user_id == user_id).order_by(UserActivity.created_at.desc()).limit(250).all()
        rows = [
            {
                "id": a.id,
                "user_id": a.user_id,
                "action": a.action,
                "transport_mode": a.transport_mode,
                "electricity_kwh": a.electricity_kwh,
                "waste_kg": a.waste_kg,
                "time_of_day": a.time_of_day,
                "location_aqi": a.location_aqi,
                "weather_temp": a.weather_temp,
                "created_at": str(a.created_at)
            }
            for a in activities
        ]

        fallback_reason = None
        start_time = time.perf_counter()
        
        try:
            from app.ml.tfrs_model import CarbonTFRSModel

            ranked = CarbonTFRSModel().rank(
                {
                    "time_of_day": time_of_day,
                    "location_aqi": location_aqi,
                    "weather_temp": weather_temp,
                    "history": rows,
                }
            )
            learned = BehaviorRankingModel(rows)
            predicted, confidence = learned.predict_mode(time_of_day)
            recommendation = ranked[0].replace("take ", "")
            model = "tensorflow-recommenders-ranking"
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(f"Generated TFRS recommendation in {latency_ms}ms")
            
        except ImportError as e:
            logger.warning("Falling back to sqlite-behavior-ranking due to ImportError: %s", e)
            fallback_reason = "ML dependencies not installed"
            
            learned = BehaviorRankingModel(rows)
            predicted, confidence = learned.predict_mode(time_of_day)
            recommendation = learned.best_alternative(predicted, location_aqi, weather_temp)
            model = "sqlite-behavior-ranking"
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        impact = reduction_percent(predicted, recommendation)
        return RecommendationResult(
            prediction=f"You will likely take {predicted} around {time_of_day}:00",
            recommendation=f"Take {recommendation}",
            impact_percent=impact,
            confidence=confidence,
            model=model,
            latency_ms=latency_ms,
            fallback_reason=fallback_reason,
        )
