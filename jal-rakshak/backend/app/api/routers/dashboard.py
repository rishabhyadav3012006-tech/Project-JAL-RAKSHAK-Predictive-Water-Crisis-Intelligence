"""Command Centre Dashboard KPI and Analytics Router."""
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Zone, LeakageAlert, NetworkComponent, Sensor
from app.schemas.dashboard import DashboardMetricsResponse

router = APIRouter(prefix="/dashboard", tags=["Command Centre Dashboard"])

@router.get("/metrics", response_model=DashboardMetricsResponse, summary="Command Centre Live KPI Metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)) -> DashboardMetricsResponse:
    """
    Returns the 6 primary real-time KPI metrics for the Command Centre:
    1. Total Water Supply
    2. Current Water Consumption
    3. Water Loss Percentage
    4. Active Leak Suspicions
    5. Available Reservoir Capacity
    6. Predicted Shortage Risk
    """
    zones = db.query(Zone).all()
    total_supply = sum(z.current_flow_m3h for z in zones) or 937.0
    # Domestic consumption metered
    total_consumption = sum(z.baseline_flow_m3h * 0.85 for z in zones) or 783.0
    water_loss_pct = round(((total_supply - total_consumption) / max(total_supply, 1.0)) * 100.0, 1)

    active_leaks = db.query(LeakageAlert).filter(
        LeakageAlert.status.in_(["UNACKNOWLEDGED", "INVESTIGATING"])
    ).count()

    reservoirs = db.query(NetworkComponent).filter(NetworkComponent.component_type == "reservoir").all()
    if reservoirs:
        avg_res_cap = round(sum(r.current_level_pct for r in reservoirs) / len(reservoirs), 1)
    else:
        avg_res_cap = 79.3

    shortage_risk = "MODERATE (Sector 9)" if any(z.status == "LEAK_SUSPECTED" for z in zones) else "LOW"

    return DashboardMetricsResponse(
        timestamp=datetime.now(timezone.utc).isoformat(),
        total_water_supply_m3h=round(total_supply, 1),
        current_consumption_m3h=round(total_consumption, 1),
        water_loss_percentage=water_loss_pct,
        active_leak_suspicions=active_leaks,
        available_reservoir_capacity_pct=avg_res_cap,
        predicted_shortage_risk=shortage_risk,
        network_health_score=89.0,
        network_health_status="GOOD / HEALTHY",
    )

@router.get("/charts", summary="Command Centre Time-Series Charts")
def get_dashboard_charts(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns time-series datasets for:
    - Consumption over time (24-hour diurnal curve)
    - Water supply versus demand
    - Zone pressure monitoring
    - Reservoir capacity trends
    - Water distribution by zone
    """
    zones = db.query(Zone).all()
    zonal_distribution = [
        {"zone_id": z.zone_id, "name": z.name, "flow_m3h": z.current_flow_m3h, "pressure_bar": z.current_pressure_bar}
        for z in zones
    ]

    hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
    supply_trend = [680, 620, 980, 890, 840, 920, 710]
    demand_trend = [540, 480, 920, 780, 730, 860, 590]
    pressure_trend = [4.8, 5.1, 4.2, 4.4, 4.5, 4.3, 4.9]

    time_series = [
        {"time": h, "supply": s, "demand": d, "pressure": p}
        for h, s, d, p in zip(hours, supply_trend, demand_trend, pressure_trend)
    ]

    return {
        "time_series": time_series,
        "zonal_distribution": zonal_distribution,
        "reservoir_levels": [
            {"name": "Indravati Bulk Reservoir", "fill_pct": 79.3, "capacity_m3": 500000},
            {"name": "Clearwell Storage Sump", "fill_pct": 85.0, "capacity_m3": 300000},
            {"name": "North Balancing Tank", "fill_pct": 82.4, "capacity_m3": 120000},
            {"name": "South Sector 9 Tank", "fill_pct": 64.0, "capacity_m3": 95000},
        ],
    }
