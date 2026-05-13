"""
Orcanos Performance Testing Tool — FastAPI Backend
Main entry point for the application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from backend.services.database import init_db
from backend.routes.scenarios import router as scenarios_router
from backend.routes.auth import router as auth_router
from backend.routes.accounts import router as accounts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Orcanos Performance Testing Tool",
    description="Performance and stability monitoring for Orcanos accounts",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(accounts_router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(scenarios_router, prefix="/api/scenarios", tags=["Scenarios"])



@app.get("/health")
async def health_check():
    return {"status": "ok", "backend_version": "0.1.0"}


@app.get("/")
async def root():
    return {"message": "Orcanos Performance Testing Tool API", "version": "0.1.0", "docs": "/docs"}
