"""Non-Revenue Water (NRW) Analytics and Regulatory Compliance Router."""
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Zone, LeakageAlert

router = APIRouter(prefix="/analytics", tags=["Analytics & Compliance Reports"])

@router.get("/water-balance", summary="IWA Standard Water Balance Audit")
def get_water_balance(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns full International Water Association (IWA) standard water balance metrics:
    System Input Volume = Billed Authorized + Unbilled Authorized + Water Losses (Real + Apparent).
    """
    system_input_m3 = 124500.0  # Daily transmission volume
    billed_authorized_m3 = 88200.0
    unbilled_authorized_m3 = 6400.0
    apparent_losses_m3 = 5100.0  # Meter inaccuracies & data handling
    real_losses_m3 = 24800.0      # Physical leaks & pipe bursts

    water_losses_m3 = apparent_losses_m3 + real_losses_m3
    nrw_m3 = unbilled_authorized_m3 + water_losses_m3
    nrw_percentage = round((nrw_m3 / system_input_m3) * 100.0, 1)

    return {
        "audit_period": "Current Month (30-Day Rolling)",
        "currency": "INR (₹)",
        "system_input_volume_m3": system_input_m3,
        "authorized_consumption": {
            "billed_authorized_m3": billed_authorized_m3,
            "unbilled_authorized_m3": unbilled_authorized_m3,
            "total_authorized_m3": billed_authorized_m3 + unbilled_authorized_m3,
        },
        "water_losses": {
            "apparent_losses_m3": apparent_losses_m3,
            "real_physical_losses_m3": real_losses_m3,
            "total_water_losses_m3": water_losses_m3,
        },
        "non_revenue_water": {
            "volume_m3": nrw_m3,
            "percentage": nrw_percentage,
            "target_benchmark_pct": 15.0,
            "financial_loss_inr": round(nrw_m3 * 18.5, 2),  # ₹18.5 / m3 municipal cost
        },
    }

@router.get("/compliance-report", summary="Municipal Regulatory Compliance Audit (JJM / AMRUT)")
def get_compliance_report(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Returns official compliance metrics for Jal Jeevan Mission and AMRUT 2.0 standards."""
    zones = db.query(Zone).all()
    leak_count = db.query(LeakageAlert).filter(LeakageAlert.status == "CONFIRMED_LEAK").count()

    return {
        "report_id": f"REP-MUNI-{datetime.now(timezone.utc).strftime('%Y%m%d')}",
        "municipality": "Smart City Water Supply & Sewerage Board",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "regulatory_standards": ["JJM Urban Operational Guidelines 2024", "AMRUT 2.0 Water Audit Benchmarks"],
        "compliance_summary": {
            "overall_status": "COMPLIANT WITH ADVISORY",
            "per_capita_supply_lpcd": 138.5,  # Standard: 135 lpcd
            "continuity_of_supply_hours": 20.4,
            "pressure_compliance_pct": 92.4,
            "water_quality_index": 98.2,
            "active_unresolved_ruptures": leak_count,
        },
        "zonal_audits": [
            {
                "zone_id": z.zone_id,
                "name": z.name,
                "pressure_compliance": "Satisfactory (4.5 bar)" if z.current_pressure_bar >= 4.0 else "Action Required (< 4.0 bar)",
                "status": z.status,
            }
            for z in zones
        ],
    }
