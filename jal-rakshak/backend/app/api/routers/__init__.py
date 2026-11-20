"""Export all modular API routers."""
from fastapi import APIRouter
from app.api.routers.system import router as system_router
from app.api.routers.dashboard import router as dashboard_router
from app.api.routers.users import router as users_router
from app.api.routers.zones import router as zones_router
from app.api.routers.network import router as network_router
from app.api.routers.sensors import router as sensors_router
from app.api.routers.anomalies import router as anomalies_router
from app.api.routers.leakage import router as leakage_router
from app.api.routers.demand import router as demand_router
from app.api.routers.shortage import router as shortage_router
from app.api.routers.fusion import router as fusion_router
from app.api.routers.simulation import router as simulation_router
from app.api.routers.analytics import router as analytics_router
from app.api.routers.realtime import router as realtime_router

api_router = APIRouter()

# Include all modular routers
api_router.include_router(system_router)
api_router.include_router(dashboard_router)
api_router.include_router(users_router)
api_router.include_router(zones_router)
api_router.include_router(network_router)
api_router.include_router(sensors_router)
api_router.include_router(anomalies_router)
api_router.include_router(leakage_router)
api_router.include_router(demand_router)
api_router.include_router(shortage_router)
api_router.include_router(fusion_router)
api_router.include_router(simulation_router)
api_router.include_router(analytics_router)
api_router.include_router(realtime_router)

__all__ = ["api_router"]
