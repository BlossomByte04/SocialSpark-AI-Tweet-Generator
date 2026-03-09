"""Social Spark AI — FastAPI Backend.

Built by Pallavi K for the Walnut Folks AI & Innovation Trainee assignment.
"""

import os

import json
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.mongo import is_connected, get_stats, seed_preloaded
from routes import brands, generate, compare, history
from schemas.models import HealthResponse, StatsResponse


# ---------------------------------------------------------------------------
# Lifespan — seed DB on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed preloaded brands into MongoDB
    preloaded_path = Path(__file__).parent / "examples" / "brands_preloaded.json"
    if preloaded_path.exists():
        data = json.loads(preloaded_path.read_text(encoding="utf-8"))
        count = seed_preloaded(data)
        if count:
            print(f"✅ Seeded {count} brands into MongoDB")
    yield
    # Shutdown
    print("🛑 Backend shutting down")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Social Spark AI API",
    description="Gemini-powered brand voice analysis and tweet generation",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend (localhost + Vercel production)
_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _frontend_url:
    _allowed_origins.append(_frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(brands.router)
app.include_router(generate.router)
app.include_router(compare.router)
app.include_router(history.router)


# ---------------------------------------------------------------------------
# Root endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        mongo=is_connected(),
        version="2.0.0",
    )


@app.get("/api/stats", response_model=StatsResponse)
def stats():
    return get_stats()
