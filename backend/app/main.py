"""PlantPals FastAPI application entrypoint."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import __version__
from .config import settings
from .database import Base, SessionLocal, engine
from .routers import catalog, photos, plants, stats
from .seed import seed_catalog


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed the built-in catalog on startup.
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_catalog(db)
    yield


app = FastAPI(
    title="PlantPals API",
    version=__version__,
    summary="Water reminder & log backend for the PlantPals app.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(settings.upload_dir)), name="uploads")

app.include_router(plants.router)
app.include_router(catalog.router)
app.include_router(stats.router)
app.include_router(photos.router)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok", "version": __version__}
