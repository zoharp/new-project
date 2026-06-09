"""
Authentication routes for admin login
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from backend.services.auth import get_auth_service
from datetime import timedelta

router = APIRouter()


class LoginRequest(BaseModel):
    """Login request model"""
    password: str


class LoginResponse(BaseModel):
    """Login response model"""
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Admin login endpoint
    Takes admin password and returns JWT token
    """
    auth_service = get_auth_service()

    # Verify password
    if not auth_service.verify_admin_password(request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    expires_delta = timedelta(minutes=60)
    access_token = auth_service.create_access_token(
        data={"sub": "admin"},
        expires_delta=expires_delta
    )

    return LoginResponse(
        access_token=access_token,
        expires_in_minutes=60
    )


@router.post("/logout")
async def logout():
    """
    Logout endpoint
    In a JWT-based system, logout is handled client-side by deleting the token
    """
    return {"message": "Logged out successfully"}


@router.post("/verify")
async def verify_token(token: str):
    """
    Verify if a token is valid
    """
    auth_service = get_auth_service()
    payload = auth_service.verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    return {"status": "valid", "user": payload.get("sub")}
