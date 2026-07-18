from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.routes import ai, community, emission, environment, simulation, user, auth

app = FastAPI(title="Carbon Guardian AI", version="1.0.0")
STATIC_DIR = Path(__file__).resolve().parent / "static"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "Carbon Guardian AI"}


@app.get("/", include_in_schema=False)
def dashboard() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


app.include_router(auth.router)
app.include_router(user.router)
app.include_router(emission.router)
app.include_router(ai.router)
app.include_router(community.router)
app.include_router(simulation.router)
app.include_router(environment.router)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
