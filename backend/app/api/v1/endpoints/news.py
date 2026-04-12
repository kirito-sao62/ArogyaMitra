import os
import httpx
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/news", tags=["news"])

@router.get("/", response_model=Dict[str, Any])
async def get_vaccination_news(query: str = "vaccination"):
    """
    Fetch vaccination news using GNews or fallback mock data if key missing.
    """
    api_key = os.getenv("NEWS_API_KEY")
    
    mock_data = {
        "articles": [
            {
                "title": "New Milestone reached in Global Vaccination Drive",
                "description": "Health authorities report an increase in vaccination rates across multiple regions, highlighting the impact of recent awareness campaigns and mobile clinics.",
                "publishedAt": "2026-04-12T10:00:00Z",
                "url": "https://news.google.com",
                "image": "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=800&q=80"
            },
            {
                "title": "Local Clinics Introduce Next-Gen Booster Shots",
                "description": "A new variant-specific booster has been approved and is now being administered at major health centers, promising longer lasting immunity.",
                "publishedAt": "2026-04-11T15:30:00Z",
                "url": "https://news.google.com",
                "image": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&q=80"
            },
            {
                "title": "Study Shows Strong Protection from Latest Vaccinations",
                "description": "Researchers have published a new study demonstrating the effectiveness of the recent vaccination schedules against seasonal outbreaks.",
                "publishedAt": "2026-04-10T08:15:00Z",
                "url": "https://news.google.com",
                "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80"
            }
        ]
    }
    
    if not api_key:
        return mock_data

    try:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "language": "en",
            "apiKey": api_key,
            "pageSize": 10
        }
        
        async with httpx.AsyncClient() as client:
            # NewsAPI might require a specific User-Agent
            headers = {"User-Agent": "ArogyaMitra/1.0"}
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Format to match our response schema
            articles = []
            for item in data.get("articles", []):
                # Filter out [Removed] articles which NewsAPI sometimes returns
                if item.get("title") == "[Removed]":
                    continue
                    
                articles.append({
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "publishedAt": item.get("publishedAt"),
                    "url": item.get("url"),
                    "image": item.get("urlToImage")  # NewsAPI uses urlToImage
                })
                
            if not articles:
                return mock_data
                
            return {"articles": articles}

    except Exception as e:
        print(f"Error fetching news: {e}")
        return mock_data
