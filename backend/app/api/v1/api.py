"""
MediGenius — api/v1/api.py
Router aggregator: collects all v1 endpoint routers into one.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import chat, health, session, hospitals, news, vitals, medications, diet

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(chat.router)
api_router.include_router(session.router)
api_router.include_router(hospitals.router)
api_router.include_router(news.router)
api_router.include_router(vitals.router)
api_router.include_router(medications.router)
api_router.include_router(diet.router)
