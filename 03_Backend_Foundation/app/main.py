from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_NAME, APP_VERSION, CORS_ORIGINS
from app.routes import health, interview


# Create the FastAPI application.
app = FastAPI(title=APP_NAME, version=APP_VERSION)

# Enable CORS so the frontend can communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route files using APIRouter.
app.include_router(health.router)
app.include_router(interview.router)


@app.get("/")
def root():
    """Return a simple message to confirm the backend is running."""
    return {"message": "AI Interview Simulator Backend Running"}
