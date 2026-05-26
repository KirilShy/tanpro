from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from datetime import datetime

app = FastAPI(title="TanPro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SKIN_TYPES = {
    1: {"typeName": "Type I", "description": "Very fair, always burns, never tans", "color": "#FFDFC4", "med": 200},
    2: {"typeName": "Type II", "description": "Fair, usually burns, sometimes tans", "color": "#F0C8A0", "med": 250},
    3: {"typeName": "Type III", "description": "Medium, sometimes burns, tans well", "color": "#D4A070", "med": 300},
    4: {"typeName": "Type IV", "description": "Olive, rarely burns, always tans", "color": "#B87850", "med": 450},
    5: {"typeName": "Type V", "description": "Brown, very rarely burns", "color": "#8D5524", "med": 600},
    6: {"typeName": "Type VI", "description": "Dark, almost never burns", "color": "#4A2912", "med": 1000},
}

UV_IRRADIANCE_PER_UNIT = 0.025


class ExposureRequest(BaseModel):
    skin_type: int
    uv_index: float
    spf: int = 1


@app.get("/api/uv")
async def get_uv_data(lat: float, lng: float):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&hourly=uv_index"
        f"&daily=uv_index_max,sunrise,sunset"
        f"&timezone=auto"
        f"&forecast_days=3"
    )
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch UV data")
        data = resp.json()

    current_hour = datetime.now().hour
    hourly_uv = data["hourly"]["uv_index"]
    hourly_times = data["hourly"]["time"]

    # Today's data (first 24 hours)
    today_uv = hourly_uv[:24]
    today_times = hourly_times[:24]
    current_uv = today_uv[current_hour] if current_hour < len(today_uv) else 0

    daily = data["daily"]
    max_uv = daily["uv_index_max"][0]
    sunrise = daily["sunrise"][0]
    sunset = daily["sunset"][0]

    best_hours = [
        {"time": today_times[i], "uv": round(uv, 1)}
        for i, uv in enumerate(today_uv)
        if 3 <= uv <= 8
    ]

    # 3-day forecast
    forecast = []
    for i in range(len(daily["time"])):
        forecast.append({
            "date": daily["time"][i],
            "uv_max": round(daily["uv_index_max"][i] or 0, 1),
            "sunrise": daily["sunrise"][i],
            "sunset": daily["sunset"][i],
        })

    return {
        "current_uv": round(current_uv or 0, 1),
        "max_uv": round(max_uv or 0, 1),
        "sunrise": sunrise,
        "sunset": sunset,
        "best_hours": best_hours,
        "hourly": [
            {"time": t, "uv": round(u or 0, 1)}
            for t, u in zip(today_times, today_uv)
        ],
        "forecast": forecast,
    }


@app.post("/api/safe-exposure")
async def calculate_safe_exposure(req: ExposureRequest):
    if req.skin_type not in SKIN_TYPES:
        raise HTTPException(status_code=400, detail="Invalid skin type (1–6)")

    if req.uv_index <= 0:
        return {
            "burn_minutes": None,
            "tan_minutes": None,
            "message": "UV index is 0 — no meaningful tanning possible right now.",
        }

    skin = SKIN_TYPES[req.skin_type]
    irradiance = req.uv_index * UV_IRRADIANCE_PER_UNIT
    burn_seconds_unprotected = skin["med"] / irradiance
    burn_seconds_protected = burn_seconds_unprotected * req.spf

    burn_minutes = round(burn_seconds_protected / 60)
    tan_minutes = round(burn_seconds_unprotected * 0.6 / 60)
    all_day = burn_minutes > 600

    return {
        "burn_minutes": None if all_day else burn_minutes,
        "tan_minutes": tan_minutes,
        "all_day_protected": all_day,
        "skin_info": skin,
        "spf": req.spf,
        "uv_index": req.uv_index,
    }


@app.get("/api/skin-types")
async def get_skin_types():
    return SKIN_TYPES
