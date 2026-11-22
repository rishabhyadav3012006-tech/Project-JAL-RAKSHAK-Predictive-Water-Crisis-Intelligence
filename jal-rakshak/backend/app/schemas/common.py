"""Common schemas for pagination, filters, and standard responses."""
from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class DictAccessibleModel(BaseModel):
    """Pydantic model supporting both attribute and dict-bracket notation for backward compatibility."""
    def __getitem__(self, item: str) -> Any:
        try:
            return getattr(self, item)
        except AttributeError as exc:
            raise KeyError(item) from exc

    def __contains__(self, item: str) -> bool:
        return hasattr(self, item)

    def get(self, item: str, default: Any = None) -> Any:
        return getattr(self, item, default)

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
