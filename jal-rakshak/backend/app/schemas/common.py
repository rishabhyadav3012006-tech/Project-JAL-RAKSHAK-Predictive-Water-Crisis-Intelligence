"""Common schemas for pagination, filters, and standard responses."""
from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginationParams(BaseModel):
    skip: int = Field(default=0, ge=0, description="Number of records to skip")
    limit: int = Field(default=50, ge=1, le=500, description="Maximum number of records to return")

class PaginatedResponse(BaseModel, Generic[T]):
    total: int = Field(..., description="Total matching items in database")
    skip: int = Field(..., description="Skipped records offset")
    limit: int = Field(..., description="Page limit")
    items: List[T] = Field(..., description="List of items for current page")

class MessageResponse(BaseModel):
    message: str
    status: str = "success"
    timestamp: Optional[str] = None
