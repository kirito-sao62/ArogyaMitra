import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.tools.llm_client import get_llm
from app.core.logging_config import logger

router = APIRouter(prefix="/diet-plan", tags=["diet"])

class DietPlanRequest(BaseModel):
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    restrictions: Optional[str] = ""
    goal: str

@router.post("/", response_model=Dict[str, Any])
async def generate_diet_plan(req: DietPlanRequest):
    """
    Generate a 7-day diet plan using Groq LLM strictly formulated as JSON output.
    """
    llm = get_llm()
    if not llm:
        raise HTTPException(status_code=503, detail="AI Service is currently unavailable")
        
    prompt = f"""You are an expert nutritionist and medical AI.
Generate a structured 7-day meal plan based on the following patient profile:
- Age: {req.age if req.age else 'Not specified'}
- Weight: {req.weight} kg
- Height: {req.height} cm
- Goal: {req.goal}
- Dietary Restrictions: {req.restrictions if req.restrictions else 'None'}

CRITICAL INSTRUCTION: You MUST output ONLY valid JSON. Absolutely no conversational text. Do not wrap the JSON in markdown blocks (e.g. ```json). Your response must begin with {{ and end with }}.

Structure your JSON exactly like the following example:
{{
  "Day 1": {{
    "Breakfast": {{"meal": "Description of breakfast", "calories": "~300 kcal"}},
    "Lunch": {{"meal": "Description of lunch", "calories": "~500 kcal"}},
    "Dinner": {{"meal": "Description of dinner", "calories": "~600 kcal"}},
    "Snack": {{"meal": "Description of snack", "calories": "~150 kcal"}}
  }},
  "Day 2": {{
    ...
  }}
  ... up to "Day 7"
}}
"""

    try:
        response = llm.invoke(prompt)
        content = (
            response.content.strip()
            if hasattr(response, "content")
            else str(response).strip()
        )
        
        # Cleanup potential markdown ticks if the model disobeys instructions
        if content.startswith("```json"):
            content = content.replace("```json", "", 1).strip()
        if content.startswith("```"):
            content = content.replace("```", "", 1).strip()
        if content.endswith("```"):
            content = content[::-1].replace("```", "", 1)[::-1].strip()
            
        # Parse output ensuring JSON parity
        diet_plan_json = json.loads(content)
        return {"status": "success", "diet_plan": diet_plan_json}
        
    except json.JSONDecodeError as decode_err:
        logger.error(f"LLM failed to output valid JSON. Payload: {content}")
        raise HTTPException(status_code=500, detail="The AI failed to format the response into proper JSON structure.")
    except Exception as e:
        logger.error(f"Error invoking Diet Plan LLM: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
