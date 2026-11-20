from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel

class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    timestamp: datetime
    details: Dict[str, Any]
