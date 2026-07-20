"""Environment router module."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.services.external import live_environment
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/environment", tags=["environment"])


@router.get("/live")
async def live(current_user: User = Depends(get_current_user), location: str = "Delhi") -> dict:
    """Return live environmental data (mocked)."""
    return await live_environment(location)
