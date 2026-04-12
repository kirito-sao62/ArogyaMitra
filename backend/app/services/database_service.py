"""
MediGenius — services/database_service.py
DatabaseService: all CRUD operations for chat history.
"""

from typing import Any, Dict, List, Optional

from sqlalchemy import delete, desc, func, select
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.db.session import SessionLocal, engine
from app.models.message import Base, Message
from app.models.vital import Vital
from app.models.medication import Medication


class DatabaseService:
    """All database CRUD operations for chat history."""

    def __init__(self, session_local=None, engine_instance=None):
        self.SessionLocal = session_local or SessionLocal
        self.engine = engine_instance or engine
        logger.info("DatabaseService initialized")

    def init_db(self) -> None:
        """Create all tables if they don't exist."""
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=self.engine)

    def get_session(self) -> Session:
        return self.SessionLocal()

    def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        source: Optional[str] = None,
    ) -> None:
        logger.debug("Saving %s message for session %s...", role, session_id[:8])
        with self.get_session() as session:
            session.add(
                Message(
                    session_id=session_id, role=role, content=content, source=source
                )
            )
            session.commit()

    def get_chat_history(self, session_id: str) -> List[Dict]:
        with self.get_session() as session:
            stmt = (
                select(Message)
                .where(Message.session_id == session_id)
                .order_by(Message.timestamp)
            )
            return [msg.to_dict() for msg in session.execute(stmt).scalars().all()]

    def get_all_sessions(self) -> List[Dict]:
        with self.get_session() as session:
            latest_sub = (
                select(
                    Message.session_id,
                    func.max(Message.timestamp).label("max_ts"),
                )
                .where(Message.role == "user")
                .group_by(Message.session_id)
                .subquery()
            )
            stmt = (
                select(Message.session_id, Message.content, Message.timestamp)
                .join(
                    latest_sub,
                    (Message.session_id == latest_sub.c.session_id)
                    & (Message.timestamp == latest_sub.c.max_ts),
                )
                .order_by(desc(Message.timestamp))
            )
            return [
                {
                    "session_id": row[0],
                    "preview": row[1][:50] + "..." if len(row[1]) > 50 else row[1],
                    "last_active": row[2].isoformat() if row[2] else None,
                }
                for row in session.execute(stmt).all()
            ]

    def delete_session(self, session_id: str) -> None:
        logger.info("Deleting session %s...", session_id[:8])
        with self.get_session() as session:
            session.execute(delete(Message).where(Message.session_id == session_id))
            session.commit()

    def log_vital(
        self,
        user_id: str,
        weight: Optional[float] = None,
        sleep_hours: Optional[float] = None,
        water_intake: Optional[float] = None,
    ) -> Dict:
        logger.debug("Logging vital for user %s", user_id)
        with self.get_session() as session:
            vital = Vital(
                user_id=user_id,
                weight=weight,
                sleep_hours=sleep_hours,
                water_intake=water_intake
            )
            session.add(vital)
            session.commit()
            session.refresh(vital)
            return vital.to_dict()

    def get_vitals(self, user_id: str, days: int = 30) -> List[Dict]:
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() - timedelta(days=days)
        with self.get_session() as session:
            stmt = (
                select(Vital)
                .where(Vital.user_id == user_id)
                .where(Vital.timestamp >= cutoff)
                .order_by(Vital.timestamp)
            )
            return [v.to_dict() for v in session.execute(stmt).scalars().all()]

    def delete_vital(self, vital_id: int) -> bool:
        with self.get_session() as session:
            vital = session.get(Vital, vital_id)
            if vital:
                session.delete(vital)
                session.commit()
                return True
            return False

    def delete_all_vitals(self, user_id: str) -> int:
        from sqlalchemy import delete
        with self.get_session() as session:
            stmt = delete(Vital).where(Vital.user_id == user_id)
            result = session.execute(stmt)
            session.commit()
            session.commit()
            return result.rowcount

    # --- Medication Methods ---
    def add_medication(self, user_id: str, name: str, dosage: str, frequency: str, reminder_times: list) -> Dict:
        logger.debug("Adding medication for user %s", user_id)
        with self.get_session() as session:
            medication = Medication(
                user_id=user_id,
                name=name,
                dosage=dosage,
                frequency=frequency,
                reminder_times=",".join(reminder_times),
                last_taken=None
            )
            session.add(medication)
            session.commit()
            session.refresh(medication)
            return medication.to_dict()

    def get_medications(self, user_id: str) -> List[Dict]:
        with self.get_session() as session:
            stmt = select(Medication).where(Medication.user_id == user_id)
            return [m.to_dict() for m in session.execute(stmt).scalars().all()]

    def update_medication_status(self, medication_id: int, last_taken: str) -> Dict[str, Any]:
        with self.get_session() as session:
            med = session.get(Medication, medication_id)
            if not med:
                return {}
            med.last_taken = last_taken
            session.commit()
            session.refresh(med)
            return med.to_dict()

    def delete_medication(self, medication_id: int) -> bool:
        with self.get_session() as session:
            med = session.get(Medication, medication_id)
            if med:
                session.delete(med)
                session.commit()
                return True
            return False

# Module-level singleton
db_service = DatabaseService()
