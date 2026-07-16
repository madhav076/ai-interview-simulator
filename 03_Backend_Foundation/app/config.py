import os

from dotenv import load_dotenv


# Load values from the .env file into environment variables.
load_dotenv()


# Basic project settings are kept in one place so beginners can find them easily.
APP_NAME = os.getenv("APP_NAME", "AI Interview Simulator Backend")
APP_VERSION = os.getenv("APP_VERSION", "0.1.0")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# CORS controls which frontend URLs can call this backend.
# Use "*" for local development so any frontend can call the API.
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
