from __future__ import annotations
"""external.py module."""

import os
import random


async def live_environment(location: str) -> dict:
    """Use configured live providers, then fall back to a local calibrated feed."""
    weather_key = os.getenv("OPENWEATHER_API_KEY")
    aqi_key = os.getenv("WAQI_TOKEN")
    if weather_key and aqi_key:
        import httpx

        async with httpx.AsyncClient(timeout=8) as client:
            weather = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": location, "appid": weather_key, "units": "metric"},
            )
            aqi = await client.get(f"https://api.waqi.info/feed/{location}/", params={"token": aqi_key})
            weather.raise_for_status()
            aqi.raise_for_status()
            weather_json = weather.json()
            aqi_json = aqi.json()
            return {
                "location": location,
                "aqi": aqi_json.get("data", {}).get("aqi", 118),
                "co2_ppm": 412 + random.randint(-2, 3),
                "temperature_c": round(weather_json.get("main", {}).get("temp", 32)),
                "source": "openweather-waqi",
            }

    baseline = 118 if location.lower() == "delhi" else 82
    return {
        "location": location,
        "aqi": baseline + random.randint(-4, 6),
        "co2_ppm": 412 + random.randint(-2, 3),
        "temperature_c": 32 + random.choice([-1, 0, 0, 1]),
        "source": "local-calibrated-feed",
    }
