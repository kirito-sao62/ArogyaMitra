"""
MediGenius — models/medication.py
SQLAlchemy ORM model for medicine scheduling and monitoring.
"""

from typing import Dict
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.models.message import Base

class Medication(Base):
    """Persisted medication parameters and reminder schedules."""

    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    dosage = Column(String(255), nullable=False)
    frequency = Column(String(255), nullable=False)
    reminder_times = Column(String(255), nullable=False) # comma-separated timestamps (i.e '08:00, 20:00')
    last_taken = Column(String(255), nullable=True) # stores ISO date of last time checkbox was hit

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "reminder_times": [t.strip() for t in self.reminder_times.split(",")] if self.reminder_times else [],
            "last_taken": self.last_taken
        }
