"""
Authentication service for admin access
Handles session tokens and password verification
"""

from datetime import datetime, timedelta
from typing import Optional
import os
import jwt
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("ADMIN_PASSWORD", "change-me-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


class AuthService:
    """Service for authentication and session management"""

    @staticmethod
    def verify_admin_password(provided_password: str) -> bool:
        """
        Verify admin password
        Args:
            provided_password: The password provided by the user
        Returns:
            True if password matches, False otherwise
        """
        admin_password = os.getenv("ADMIN_PASSWORD")
        if not admin_password:
            raise ValueError("ADMIN_PASSWORD not configured")

        # Simple string comparison for admin password
        return provided_password == admin_password

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token
        Args:
            data: Data to encode in the token
            expires_delta: Token expiration time
        Returns:
            The JWT token
        """
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """
        Verify and decode a JWT token
        Args:
            token: The JWT token to verify
        Returns:
            The decoded token data, or None if invalid
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.InvalidTokenError:
            return None


# Singleton instance
_auth_service = None


def get_auth_service() -> AuthService:
    """Get the auth service"""
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
