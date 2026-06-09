"""
Test run routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from backend.models import TestRun
from backend.services.database import get_db

router = APIRouter()


class TestRunRequest(BaseModel):
    """Test run creation request"""
    scenario_id: int


class TestRunResponse(BaseModel):
    """Test run response"""
    id: int
    scenario_id: int
    status: str
    started_at: str
    completed_at: str = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[TestRunResponse])
async def list_runs(db: Session = Depends(get_db)):
    """
    Get all test runs
    """
    runs = db.query(TestRun).all()
    return runs


@router.get("/{run_id}", response_model=TestRunResponse)
async def get_run(run_id: int, db: Session = Depends(get_db)):
    """
    Get a specific test run
    """
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return run


@router.post("/", response_model=TestRunResponse)
async def create_run(request: TestRunRequest, db: Session = Depends(get_db)):
    """
    Create and start a new test run
    This is a placeholder — actual implementation will trigger test execution
    """
    # TODO: Trigger test execution
    run = TestRun(scenario_id=request.scenario_id, status="pending")
    db.add(run)
    db.commit()
    db.refresh(run)
    return run
