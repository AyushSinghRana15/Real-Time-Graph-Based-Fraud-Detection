from pydantic import BaseModel
from typing import Literal

class Alert(BaseModel):
    id: str
    type: Literal["high_risk", "medium_risk", "low_risk", "info"]
    entityId: str
    entityName: str
    amount: float
    timestamp: str
    description: str
    indicators: list[str]
    confidence: float

class TransactionNode(BaseModel):
    id: str
    type: Literal["account", "transaction", "entity"]
    label: str
    risk: int
    connections: list[str]
