from fastapi import APIRouter


# APIRouter helps keep routes organized in separate files.
router = APIRouter()


@router.get("/health")
def health_check():
    """Return the backend health status."""
    return {"status": "OK"}
