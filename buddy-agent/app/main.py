"""
Buddy Agent — FastAPI application entry point.

Starts the FastAPI server with:
- CORS (allow frontend origin)
- Rate limiting via slowapi
- Structured JSON logging
- /health, /chat, /conversation routes
"""
import logging
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.routes import router
from app.config.settings import settings

# ── Logging setup ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

# ── Rate limiter ──────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# ── FastAPI app ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Buddy Agent",
    description="AI-powered support assistant for Buddy Studio",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────

allowed_origins = [o.strip() for o in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Routes ────────────────────────────────────────────────────────────────────

app.include_router(router)

# ── Startup / shutdown events ─────────────────────────────────────────────────

@app.on_event("startup")
async def on_startup():
    model = settings.gemini_model if settings.llm_provider == "gemini" else settings.openai_model
    logger.info(
        "Buddy Agent starting — provider=%s model=%s llm_ready=%s",
        settings.llm_provider,
        model,
        settings.llm_ready(),
    )


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("Buddy Agent shutting down")
