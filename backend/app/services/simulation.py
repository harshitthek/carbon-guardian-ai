from __future__ import annotations

SCENARIOS = {
    "ev_adoption_30": {
        "label": "What if 30% of Delhi used EVs?",
        "co2_reduced_kg": 2_800_000,
        "aqi_improvement_percent": 18,
        "temp_reduction_c": 0.6,
    },
    "metro_shift_20": {
        "label": "What if 20% of cab rides shifted to metro?",
        "co2_reduced_kg": 1_650_000,
        "aqi_improvement_percent": 13,
        "temp_reduction_c": 0.4,
    },
    "urban_trees_100k": {
        "label": "What if 100k trees were planted?",
        "co2_reduced_kg": 2_200_000,
        "aqi_improvement_percent": 9,
        "temp_reduction_c": 0.3,
    },
}

def run_simulation(ev: int, solar: int, plastic: int) -> dict:
    """Run an environmental simulation using projected EV, solar, and plastic recovery rates."""
    co2_reduced = (ev * 93333) + (solar * 108000) + (plastic * 17000)
    aqi_improvement = (ev * 0.6) + (solar * 0.5) + (plastic * 0.1)
    temp_reduction = (ev * 0.02) + (solar * 0.024) + (plastic * 0.002)

    return {
        "scenario_id": "custom_projection",
        "description": f"Custom Projection: {ev}% EV, {solar}% Solar, {plastic}% Plastic Recovery",
        "co2_reduced_kg": int(co2_reduced),
        "aqi_improvement_percent": round(aqi_improvement, 1),
        "temp_reduction_c": round(temp_reduction, 2),
    }
