"""IoT Telemetry Simulation and Scenario Router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import SimulationScenario
from app.schemas.entities import SimulationScenarioOut
from app.schemas.common import MessageResponse
from app.schemas.simulation import SimulatorControlRequest, SimulationStatusResponse
from simulation.engine import sim_engine

router = APIRouter(prefix="/simulation", tags=["IoT Simulation Engine & Scenarios"])

@router.get("/scenarios", response_model=List[SimulationScenarioOut], summary="List configurable simulation scenarios")
def list_simulation_scenarios(db: Session = Depends(get_db)):
    """Returns all pre-configured simulation scenarios (NORMAL, PIPE_BURST, PEAK_DEMAND, PUMP_TRIP)."""
    return db.query(SimulationScenario).all()

@router.get("/status", summary="Get IoT simulator runtime state")
def get_simulation_status():
    """Returns active scenario, running status, tick count, and connected broker status."""
    return sim_engine.get_status()

@router.post("/control", summary="Control IoT simulator execution (start, pause, reset)")
def control_simulation(req: SimulatorControlRequest):
    """Starts, pauses, or resets the virtual IoT telemetry generator."""
    if req.action == "start":
        sim_engine.start()
        if req.scenario:
            sim_engine.set_scenario(req.scenario)
        return {"status": "started", "active_scenario": sim_engine.current_scenario}
    elif req.action == "pause":
        sim_engine.pause()
        return {"status": "paused", "active_scenario": sim_engine.current_scenario}
    elif req.action == "reset":
        sim_engine.reset()
        return {"status": "reset", "active_scenario": sim_engine.current_scenario}
    raise HTTPException(status_code=400, detail="Invalid action")

@router.post("/scenario/{scenario_key}/activate", response_model=MessageResponse, summary="Activate simulation scenario")
def activate_scenario(scenario_key: str, db: Session = Depends(get_db)):
    scenarios = db.query(SimulationScenario).all()
    found = False
    for s in scenarios:
        if s.scenario_key == scenario_key:
            s.is_active = True
            found = True
        else:
            s.is_active = False

    if not found:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_key}' not found")

    db.commit()
    sim_engine.set_scenario(scenario_key.lower())
    return MessageResponse(message=f"Simulation scenario '{scenario_key}' activated successfully")
