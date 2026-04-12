from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.database_service import db_service

router = APIRouter(prefix="/medications", tags=["medications"])

class MedicationCreate(BaseModel):
    user_id: str = "default_user"
    name: str
    dosage: str
    frequency: str
    reminder_times: List[str]

class MedicationUpdateStatus(BaseModel):
    last_taken: str

@router.post("/", response_model=Dict[str, Any])
async def add_medication(med_in: MedicationCreate):
    try:
        med_dict = db_service.add_medication(
            user_id=med_in.user_id,
            name=med_in.name,
            dosage=med_in.dosage,
            frequency=med_in.frequency,
            reminder_times=med_in.reminder_times
        )
        return {"status": "success", "data": med_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=List[Dict[str, Any]])
async def get_medications(user_id: str):
    try:
        return db_service.get_medications(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{medication_id}/status", response_model=Dict[str, Any])
async def update_medication_status(medication_id: int, status_update: MedicationUpdateStatus):
    try:
        updated_dict = db_service.update_medication_status(
            medication_id=medication_id,
            last_taken=status_update.last_taken
        )
        if not updated_dict:
            raise HTTPException(status_code=404, detail="Medication not found")
        return {"status": "success", "data": updated_dict}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{medication_id}", response_model=Dict[str, Any])
async def delete_medication(medication_id: int):
    try:
        success = db_service.delete_medication(medication_id=medication_id)
        if not success:
            raise HTTPException(status_code=404, detail="Medication not found")
        return {"status": "success", "message": "Medication successfully deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
