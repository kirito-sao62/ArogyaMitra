import random
import httpx
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.get("/", response_model=List[Dict[str, Any]])
async def get_nearby_hospitals(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    location: Optional[str] = None
):
    """
    Fetch nearby hospitals based on lat/lon or a location string.
    Uses Nominatim API (OpenStreetMap).
    """
    if not (lat and lon) and not location:
        raise HTTPException(status_code=400, detail="Must provide either lat/lon or 'location' string.")

    headers = {"User-Agent": "ArogyaMitra-HospitalSearch/1.0"}
    
    try:
        async with httpx.AsyncClient() as client:
            if location:
                # Text-based search
                url = "https://nominatim.openstreetmap.org/search"
                params = {"q": f"hospitals in {location}", "format": "jsonv2", "limit": 15}
            else:
                # Coordinate-based search
                url = "https://nominatim.openstreetmap.org/search"
                params = {
                    "q": "hospital",
                    "format": "jsonv2",
                    "lat": str(lat),
                    "lon": str(lon),
                    "limit": 15
                }

            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            hospitals = []
            for item in data:
                # Need to filter out empty names or irrelevant places
                name = item.get("display_name", "").split(",")[0]
                if not item.get("name") and not name.lower().count("hospital"):
                    continue
                    
                display_name = item.get("name") or name
                address = item.get("display_name", "")
                
                # Exclude if it's the exact same name to prevent duplicates
                if any(h["name"] == display_name for h in hospitals):
                    continue
                    
                # Mock a star rating
                rating = round(random.uniform(3.5, 5.0), 1)
                
                hospitals.append({
                    "id": item.get("place_id"),
                    "name": display_name,
                    "address": address,
                    "lat": item.get("lat"),
                    "lon": item.get("lon"),
                    "rating": rating
                })
                
            return hospitals

    except Exception as e:
        # Fallback graceful error handler -> Return a mock hospital in case API fails
        print(f"Error fetching hospitals: {e}")
        return [
            {
                "id": 1,
                "name": "City Core Hospital (Mock Data - API Error)",
                "address": "123 Health Ave, Medical District",
                "lat": "0", "lon": "0",
                "rating": 4.8
            }
        ]
