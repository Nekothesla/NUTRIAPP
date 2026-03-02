from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from database import engine, Base

# Import models so SQLAlchemy registers them before create_all
import models.user      # noqa: F401
import models.profile   # noqa: F401

from routers import auth, profile, calculator

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NutriApp API",
    description="Backend para el sistema de nutrición – FastAPI + SQLAlchemy",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(calculator.router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "app": "NutriApp API v1.0"}
