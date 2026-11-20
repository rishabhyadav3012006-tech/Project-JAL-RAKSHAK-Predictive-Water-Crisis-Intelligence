"""Network Infrastructure and Interactive Digital Twin Router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import NetworkComponent, SimulationScenario
from app.schemas.entities import NetworkComponentCreate, NetworkComponentOut
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.digital_twin import DigitalTwinNetworkResponse, SimulationActionRequest
from app.services.digital_twin_engine import get_base_digital_twin_network, execute_simulation_action
from app.services.hydraulic_simulator import hydraulic_service

router = APIRouter(tags=["Network Infrastructure & Digital Twin"])

class ScenarioSimulateRequest(BaseModel):
    reservoir_volume_ml: float = Field(4500.0, ge=500.0, le=10000.0)
    incoming_supply_mld: float = Field(842.0, ge=100.0, le=2500.0)
    demand_multiplier: float = Field(1.0, ge=0.2, le=3.0)
    pipelines_status: Dict[str, bool] = Field(default_factory=dict)
    pumps_status: Dict[str, str] = Field(default_factory=dict)
    simulated_leakage_mld: float = Field(0.0, ge=0.0, le=200.0)
    distribution_priorities: List[str] = Field(default_factory=lambda: ["residential", "commercial", "industrial", "agricultural"])
    name: Optional[str] = "Custom Simulation"
    scenario_key: Optional[str] = "custom"

class ScenarioCompareRequest(BaseModel):
    baseline_params: Optional[Dict[str, Any]] = None
    simulated_params: Dict[str, Any]

class SaveScenarioRequest(BaseModel):
    scenario_key: str = Field(..., min_length=3, max_length=50)
    title: str = Field(..., min_length=3, max_length=120)
    description: str
    parameters: Dict[str, Any]

@router.get("/network/components", response_model=PaginatedResponse[NetworkComponentOut], summary="List network components")
def list_components(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    component_type: Optional[str] = Query(None, description="Filter by type (reservoir, treatment_plant, pump_station, pipeline, tank, zone)"),
    zone_id: Optional[str] = Query(None, description="Filter by zone ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db)
):
    query = db.query(NetworkComponent)
    if component_type:
        query = query.filter(NetworkComponent.component_type == component_type)
    if zone_id:
        query = query.filter(NetworkComponent.zone_id == zone_id)
    if status_filter:
        query = query.filter(NetworkComponent.status == status_filter)

    total = query.count()
    items = query.order_by(NetworkComponent.id.asc()).offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, skip=skip, limit=limit, items=items)

@router.get("/network/components/{component_id}", response_model=NetworkComponentOut, summary="Get component details")
def get_component(component_id: str, db: Session = Depends(get_db)):
    comp = db.query(NetworkComponent).filter(NetworkComponent.component_id == component_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Component '{component_id}' not found")
    return comp

@router.get("/digital-twin/network", response_model=DigitalTwinNetworkResponse, summary="Get complete Digital Twin graph")
def get_digital_twin_network():
    """Returns React Flow graph with infrastructure nodes, connecting edges, flow pulses, and telemetry."""
    return get_base_digital_twin_network()

@router.post("/digital-twin/simulate", response_model=DigitalTwinNetworkResponse, summary="Execute what-if simulation on Digital Twin")
def simulate_digital_twin_action(action: SimulationActionRequest):
    """Executes a what-if crisis simulation (e.g. pump trip, pipe burst) and returns updated hydraulic states."""
    return execute_simulation_action(action.component_id, action.action)

# --- Phase 13 Advanced Digital Twin Scenario Simulator Endpoints ---

@router.post("/digital-twin/scenario/simulate", summary="Execute computational hydraulic scenario simulation")
def simulate_hydraulic_scenario(req: ScenarioSimulateRequest):
    """
    Computes full hydraulic mass balance, head pressure drops, distribution losses,
    supply-demand deficit, storage tank drawdown, and zone-level shortage risks.
    """
    return hydraulic_service.simulate(req.model_dump())

@router.get("/digital-twin/scenario/presets", summary="Get standard pre-configured municipal scenarios")
def get_preset_scenarios():
    """
    Returns the 6 standard pre-configured scenarios:
    1. Normal Distribution
    2. Increased Demand (+45%)
    3. Reduced Reservoir (Drought)
    4. Suspected Pipeline Rupture
    5. Pump Unavailable (South Booster Trip)
    6. Multiple Compounding Anomalies
    """
    return hydraulic_service.get_presets()

@router.post("/digital-twin/scenario/compare", summary="Compare baseline and simulated scenarios side-by-side")
def compare_scenarios(req: ScenarioCompareRequest):
    """Computes before vs. after deltas across all water balance, deficit, and zone availability metrics."""
    base_params = req.baseline_params or hydraulic_service.get_preset("normal")["params"]
    return hydraulic_service.compare(base_params, req.simulated_params)

@router.post("/digital-twin/scenario/save", summary="Save custom scenario configuration to database")
def save_custom_scenario(payload: SaveScenarioRequest, db: Session = Depends(get_db)):
    """Saves custom scenario configuration in the database for later reuse and benchmarking."""
    existing = db.query(SimulationScenario).filter(SimulationScenario.scenario_key == payload.scenario_key).first()
    if existing:
        existing.title = payload.title
        existing.description = payload.description
        existing.parameters_json = payload.parameters
    else:
        new_scenario = SimulationScenario(
            scenario_key=payload.scenario_key,
            title=payload.title,
            description=payload.description,
            parameters_json=payload.parameters,
            is_active=False,
        )
        db.add(new_scenario)
    db.commit()
    return {"status": "saved", "scenario_key": payload.scenario_key, "title": payload.title}

@router.get("/digital-twin/scenario/saved", summary="List saved custom scenarios")
def get_saved_scenarios(db: Session = Depends(get_db)):
    """Returns list of user-saved scenarios."""
    scenarios = db.query(SimulationScenario).order_by(SimulationScenario.id.desc()).all()
    return [
        {
            "id": s.id,
            "scenario_key": s.scenario_key,
            "title": s.title,
            "description": s.description,
            "parameters": s.parameters_json or {},
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in scenarios
    ]
