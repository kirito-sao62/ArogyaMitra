from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.database_service import db_service

router = APIRouter(prefix="/vitals", tags=["vitals"])

class VitalCreate(BaseModel):
    user_id: str = "default_user"
    weight: Optional[float] = None
    sleep_hours: Optional[float] = None
    water_intake: Optional[float] = None

@router.post("/", response_model=Dict[str, Any])
async def log_vital(vital_in: VitalCreate):
    """
    Log a new vital entry.
    """
    try:
        vital_dict = db_service.log_vital(
            user_id=vital_in.user_id,
            weight=vital_in.weight,
            sleep_hours=vital_in.sleep_hours,
            water_intake=vital_in.water_intake
        )
        return {"status": "success", "data": vital_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=List[Dict[str, Any]])
async def get_vitals(user_id: str, days: int = 30):
    """
    Fetch historical vitals for a user for the last `days` days.
    """
    try:
        return db_service.get_vitals(user_id=user_id, days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{vital_id}", response_model=Dict[str, Any])
async def delete_vital(vital_id: int):
    """
    Delete a specific vital entry by ID.
    """
    try:
        success = db_service.delete_vital(vital_id=vital_id)
        if not success:
            raise HTTPException(status_code=404, detail="Vital entry not found")
        return {"status": "success", "message": "Vital entry deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/user/{user_id}", response_model=Dict[str, Any])
async def delete_all_vitals(user_id: str):
    """
    Reset dashboard by completely wiping out all associated user vitals.
    """
    try:
        deleted_count = db_service.delete_all_vitals(user_id=user_id)
        return {"status": "success", "message": f"Deleted {deleted_count} entries"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
