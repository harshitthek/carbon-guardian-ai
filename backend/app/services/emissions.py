from __future__ import annotations

TRANSPORT_FACTORS = {
    "cab": 0.192,
    "car": 0.171,
    "bus": 0.089,
    "metro": 0.035,
    "cycling": 0.0,
    "walk": 0.0,
    "none": 0.0,
}

ELECTRICITY_FACTOR_KG_PER_KWH = 0.708
WASTE_FACTOR_KG_PER_KG = 0.57


def calculate_emission(transport_mode: str, distance_km: float, electricity_kwh: float, waste_kg: float) -> dict:
    """Calculate the total carbon emissions based on user inputs."""
    mode = transport_mode.lower()
    transport_kg = distance_km * TRANSPORT_FACTORS.get(mode, TRANSPORT_FACTORS["car"])
    electricity_kg = electricity_kwh * ELECTRICITY_FACTOR_KG_PER_KWH
    waste_emission_kg = waste_kg * WASTE_FACTOR_KG_PER_KG
    total = transport_kg + electricity_kg + waste_emission_kg

    return {
        "transport_kg": round(transport_kg, 2),
        "electricity_kg": round(electricity_kg, 2),
        "waste_kg": round(waste_emission_kg, 2),
        "total_kg": round(total, 2),
    }


def reduction_percent(current_mode: str, recommended_mode: str) -> int:
    """Calculate the percentage reduction in emissions by switching modes."""
    current = TRANSPORT_FACTORS.get(current_mode.lower(), TRANSPORT_FACTORS["car"])
    better = TRANSPORT_FACTORS.get(recommended_mode.lower(), current)
    if current <= 0:
        return 0
    return max(0, min(95, round(((current - better) / current) * 100)))
