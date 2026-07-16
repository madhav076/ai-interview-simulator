from fastapi import APIRouter
from pydantic import BaseModel


# Interview routes will live here as the project grows.
router = APIRouter(prefix="/interview", tags=["Interview"])


class InterviewStartRequest(BaseModel):
    """Simple request body for starting an interview."""

    role: str


@router.get("")
def get_interview():
    """Return a simple sample interview status."""
    return {"title": "AI Interview", "status": "Ready"}


@router.post("/start")
def start_interview(request: InterviewStartRequest):
    """Start a sample interview for the requested role."""
    return {"message": "Interview Started", "role": request.role}
