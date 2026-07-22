"""Read-only built-in plant catalog endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PlantSpecies
from ..schemas import SpeciesOut

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("", response_model=list[SpeciesOut])
def list_species(
    q: str | None = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
) -> list[PlantSpecies]:
    stmt = select(PlantSpecies).order_by(PlantSpecies.common_name.asc())
    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        stmt = stmt.where(
            func.lower(PlantSpecies.common_name).like(term)
            | func.lower(func.coalesce(PlantSpecies.scientific_name, "")).like(term)
        )
    return list(db.execute(stmt).scalars().all())
