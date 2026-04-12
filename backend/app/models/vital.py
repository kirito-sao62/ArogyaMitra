"""
MediGenius — models/vital.py
SQLAlchemy ORM model for health vitals.
"""

from datetime import datetime
from typing import Dict

from sqlalchemy import Column, DateTime, Integer, Float, String
from sqlalchemy.orm import declarative_base
from app.models.message import Base

class Vital(Base):
    """Persisted daily vital logs (weight, sleep, water)."""

    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), nullable=False, index=True) # Defaulting to global tracking for single user for now
    weight = Column(Float, nullable=True)                     # in kg or lbs
    sleep_hours = Column(Float, nullable=True)                # hours
    water_intake = Column(Float, nullable=True)               # liters or glasses
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "weight": self.weight,
            "sleep_hours": self.sleep_hours,
            "water_intake": self.water_intake,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
