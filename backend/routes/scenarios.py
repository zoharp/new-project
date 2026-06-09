"""
Scenario management routes — recording and listing
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import json

router = APIRouter()

SCENARIOS_DIR = Path(__file__).parent.parent / "scenarios"


class StartRequest(BaseModel):
    name: str
    url: str = "https://app.orcanos.com/orcanos/web/"


@router.post("/record/start")
def start_recording(req: StartRequest):
    from backend.services.recorder import session
    if session.active:
        raise HTTPException(400, "Recording already in progress")
    try:
        session.start(req.name, req.url)
    except RuntimeError as e:
        raise HTTPException(400, str(e))
    return {"status": "recording", "name": req.name, "url": req.url}


@router.post("/record/stop")
def stop_recording():
    from backend.services.recorder import session
    if not session.active:
        raise HTTPException(400, "No active recording session")
    filepath = session.stop()
    status = session.get_status()
    return {"status": "saved", "filepath": filepath, "steps": status["steps"], "step_count": len(status["steps"])}


@router.get("/record/status")
def recording_status():
    from backend.services.recorder import session
    return session.get_status()


@router.get("")
def list_scenarios():
    if not SCENARIOS_DIR.exists():
        return []
    result = []
    for f in sorted(SCENARIOS_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
        try:
            data = json.loads(f.read_text())
            result.append({
                "name": data["name"],
                "base_url": data.get("base_url", ""),
                "step_count": len(data.get("steps", [])),
                "created_at": data.get("created_at", ""),
            })
        except Exception:
            pass
    return result


@router.get("/{name}")
def get_scenario(name: str):
    filepath = SCENARIOS_DIR / f"{name}.json"
    if not filepath.exists():
        raise HTTPException(404, f"Scenario '{name}' not found")
    return json.loads(filepath.read_text())


@router.delete("/{name}")
def delete_scenario(name: str):
    filepath = SCENARIOS_DIR / f"{name}.json"
    if not filepath.exists():
        raise HTTPException(404, f"Scenario '{name}' not found")
    filepath.unlink()
    return {"status": "deleted", "name": name}
