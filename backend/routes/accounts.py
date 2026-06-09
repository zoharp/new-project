"""
Account management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from backend.models import Account
from backend.services.database import get_db
from backend.services.encryption import get_encryption_service

router = APIRouter()


class AccountRequest(BaseModel):
    """Account creation/update request"""
    name: str
    url: str
    password: str
    enabled: bool = True


class AccountResponse(BaseModel):
    """Account response (without password)"""
    id: int
    name: str
    url: str
    enabled: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AccountResponse])
async def list_accounts(db: Session = Depends(get_db)):
    """
    Get all accounts
    """
    accounts = db.query(Account).all()
    return accounts


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(account_id: int, db: Session = Depends(get_db)):
    """
    Get a specific account
    """
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("/", response_model=AccountResponse)
async def create_account(
    request: AccountRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new account
    """
    # Check if account already exists
    existing = db.query(Account).filter(Account.name == request.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account already exists")

    # Encrypt password
    encryption_service = get_encryption_service()
    encrypted_password = encryption_service.encrypt(request.password)

    # Create account
    account = Account(
        name=request.name,
        url=request.url,
        encrypted_password=encrypted_password,
        enabled=request.enabled
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    return account


@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    request: AccountRequest,
    db: Session = Depends(get_db)
):
    """
    Update an account
    """
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    account.name = request.name
    account.url = request.url
    account.enabled = request.enabled

    # Update password if provided
    if request.password:
        encryption_service = get_encryption_service()
        account.encrypted_password = encryption_service.encrypt(request.password)

    db.commit()
    db.refresh(account)

    return account


@router.delete("/{account_id}", status_code=204)
async def delete_account(account_id: int, db: Session = Depends(get_db)):
    """
    Delete an account
    """
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(account)
    db.commit()

    return None
