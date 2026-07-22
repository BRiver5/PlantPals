"""Plant CRUD and watering endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import device_uuid
from ..models import Plant, WateringLog
from ..models import utcnow
from ..schemas import (
    PlantCreate,
    PlantDetailOut,
    PlantOut,
    PlantUpdate,
    WaterEventIn,
    WateringLogOut,
)
from ..scheduling import apply_watering, compute_next_due

router = APIRouter(prefix="/plants", tags=["plants"])


def _get_owned_plant(db: Session, plant_id: int, device: str) -> Plant:
    plant = db.get(Plant, plant_id)
    if plant is None or plant.device_uuid != device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found.")
    return plant


@router.get("", response_model=list[PlantOut])
def list_plants(db: Session = Depends(get_db), device: str = Depends(device_uuid)) -> list[Plant]:
    stmt = (
        select(Plant)
        .where(Plant.device_uuid == device)
        .order_by(Plant.next_due_at.asc(), Plant.name.asc())
    )
    return list(db.execute(stmt).scalars().all())


@router.post("", response_model=PlantDetailOut, status_code=status.HTTP_201_CREATED)
def create_plant(
    payload: PlantCreate,
    db: Session = Depends(get_db),
    device: str = Depends(device_uuid),
) -> Plant:
    now = utcnow()
    anchor = payload.last_watered_at or now
    plant = Plant(
        device_uuid=device,
        name=payload.name.strip(),
        species=payload.species,
        photo_url=payload.photo_url,
        interval_days=payload.interval_days,
        water_amount_ml=payload.water_amount_ml,
        location=payload.location,
        care_notes=payload.care_notes,
        created_at=now,
        last_watered_at=payload.last_watered_at,
        next_due_at=compute_next_due(anchor, payload.interval_days),
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


@router.get("/{plant_id}", response_model=PlantDetailOut)
def get_plant(
    plant_id: int,
    db: Session = Depends(get_db),
    device: str = Depends(device_uuid),
) -> Plant:
    return _get_owned_plant(db, plant_id, device)


@router.patch("/{plant_id}", response_model=PlantDetailOut)
def update_plant(
    plant_id: int,
    payload: PlantUpdate,
    db: Session = Depends(get_db),
    device: str = Depends(device_uuid),
) -> Plant:
    plant = _get_owned_plant(db, plant_id, device)
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is not None:
        data["name"] = data["name"].strip()
    for field, value in data.items():
        setattr(plant, field, value)
    # If the interval changed, recompute the next due date from the current anchor.
    if "interval_days" in data:
        anchor = plant.last_watered_at or plant.created_at
        plant.next_due_at = compute_next_due(anchor, plant.interval_days)
    db.commit()
    db.refresh(plant)
    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(
    plant_id: int,
    db: Session = Depends(get_db),
    device: str = Depends(device_uuid),
) -> None:
    plant = _get_owned_plant(db, plant_id, device)
    db.delete(plant)
    db.commit()


@router.post("/{plant_id}/water", response_model=PlantDetailOut, status_code=status.HTTP_201_CREATED)
def water_plant(
    plant_id: int,
    payload: WaterEventIn | None = None,
    db: Session = Depends(get_db),
    device: str = Depends(device_uuid),
) -> Plant:
    plant = _get_owned_plant(db, plant_id, device)
    watered_at = (payload.watered_at if payload else None) or utcnow()
    log = WateringLog(plant_id=plant.id, device_uuid=device, watered_at=watered_at)
    db.add(log)
    apply_watering(plant, watered_at)
    db.commit()
    db.refresh(plant)
    return plant


@router.get("/{plant_id}/history", response_model=list[WateringLogOut])
def plant_history(
    plant_id: int,
    db: Session = Depends(get_db),
    device: str = Depends(device_uuid),
) -> list[WateringLog]:
    plant = _get_owned_plant(db, plant_id, device)
    stmt = (
        select(WateringLog)
        .where(WateringLog.plant_id == plant.id)
        .order_by(WateringLog.watered_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


@router.delete(
    "/{plant_id}/history/{log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_watering(
    plant_id: int,
    log_id: int,
    db: Session = Depends(get_db),
    device: str = Depends(device_uuid),
) -> None:
    plant = _get_owned_plant(db, plant_id, device)
    log = db.get(WateringLog, log_id)
    if log is None or log.plant_id != plant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found.")
    db.delete(log)
    # Re-anchor schedule to the most recent remaining log (or creation time).
    remaining = db.execute(
        select(WateringLog)
        .where(WateringLog.plant_id == plant.id)
        .order_by(WateringLog.watered_at.desc())
    ).scalars().first()
    plant.last_watered_at = remaining.watered_at if remaining else None
    anchor = plant.last_watered_at or plant.created_at
    plant.next_due_at = compute_next_due(anchor, plant.interval_days)
    db.commit()
