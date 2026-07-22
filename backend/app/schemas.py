"""Pydantic request/response schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PlantBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    species: str | None = Field(default=None, max_length=120)
    interval_days: int = Field(default=7, ge=1, le=365)
    water_amount_ml: int | None = Field(default=None, ge=1, le=100_000)
    location: str | None = Field(default=None, max_length=120)
    care_notes: str | None = Field(default=None, max_length=2000)
    photo_url: str | None = Field(default=None, max_length=500)


class PlantCreate(PlantBase):
    """Payload for creating a plant. Optional last_watered_at anchors the schedule."""

    last_watered_at: datetime | None = None


class PlantUpdate(BaseModel):
    """Partial update — every field optional."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    species: str | None = Field(default=None, max_length=120)
    interval_days: int | None = Field(default=None, ge=1, le=365)
    water_amount_ml: int | None = Field(default=None, ge=1, le=100_000)
    location: str | None = Field(default=None, max_length=120)
    care_notes: str | None = Field(default=None, max_length=2000)
    photo_url: str | None = Field(default=None, max_length=500)


class WateringLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plant_id: int
    watered_at: datetime


class PlantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    species: str | None
    photo_url: str | None
    interval_days: int
    water_amount_ml: int | None
    location: str | None
    care_notes: str | None
    created_at: datetime
    last_watered_at: datetime | None
    next_due_at: datetime


class PlantDetailOut(PlantOut):
    logs: list[WateringLogOut] = []


class WaterEventIn(BaseModel):
    """Optional explicit timestamp for a watering event (defaults to now)."""

    watered_at: datetime | None = None


class PhotoUploadOut(BaseModel):
    photo_url: str


class SpeciesOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    common_name: str
    scientific_name: str | None
    default_interval_days: int
    default_water_amount_ml: int
    light: str
    difficulty: str
    care_tip: str


class WeeklyBucket(BaseModel):
    week_start: str  # ISO date (Monday)
    label: str
    count: int


class StatsOut(BaseModel):
    total_plants: int
    waterings_this_month: int
    waterings_total: int
    due_today: int
    overdue: int
    current_streak: int
    best_streak: int
    weekly: list[WeeklyBucket]
