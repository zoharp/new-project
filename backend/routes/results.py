"""
Test results routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from backend.models import StepResult
from backend.services.database import get_db

router = APIRouter()


class StepResultResponse(BaseModel):
    """Step result response"""
    id: int
    run_id: int
    account_id: int
    step_name: str
    duration_seconds: float
    status: str
    error_message: str = None

    class Config:
        from_attributes = True


@router.get("/run/{run_id}", response_model=List[StepResultResponse])
async def get_run_results(run_id: int, db: Session = Depends(get_db)):
    """
    Get all step results for a test run
    """
    results = db.query(StepResult).filter(StepResult.run_id == run_id).all()
    return results


@router.get("/step/{step_id}", response_model=StepResultResponse)
async def get_step_result(step_id: int, db: Session = Depends(get_db)):
    """
    Get a specific step result
    """
    result = db.query(StepResult).filter(StepResult.id == step_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Step result not found")
    return result


@router.get("/", response_model=List[StepResultResponse])
async def list_results(db: Session = Depends(get_db)):
    """
    Get all step results
    """
    results = db.query(StepResult).all()
    return results
