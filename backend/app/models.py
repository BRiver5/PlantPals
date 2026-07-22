"""SQLAlchemy ORM models."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    """Timezone-aware UTC now (stored as naive UTC in SQLite)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Plant(Base):
    """A plant owned by an anonymous device."""

    __tablename__ = "plants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    device_uuid: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    species: Mapped[str | None] = mapped_column(String(120), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    interval_days: Mapped[int] = mapped_column(Integer, nullable=False, default=7)
    water_amount_ml: Mapped[int | None] = mapped_column(Integer, nullable=True)
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    care_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)
    last_watered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_due_at: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)

    logs: Mapped[list["WateringLog"]] = relationship(
        back_populates="plant",
        cascade="all, delete-orphan",
        order_by="WateringLog.watered_at.desc()",
    )

    __table_args__ = (Index("ix_plants_device_due", "device_uuid", "next_due_at"),)


class WateringLog(Base):
    """A single watering event for a plant."""

    __tablename__ = "watering_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plant_id: Mapped[int] = mapped_column(
        ForeignKey("plants.id", ondelete="CASCADE"), index=True, nullable=False
    )
    device_uuid: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    watered_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True, nullable=False)

    plant: Mapped["Plant"] = relationship(back_populates="logs")


class PlantSpecies(Base):
    """Built-in catalog of common houseplants used to pre-fill new plants."""

    __tablename__ = "plant_species"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    common_name: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    scientific_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    default_interval_days: Mapped[int] = mapped_column(Integer, nullable=False)
    default_water_amount_ml: Mapped[int] = mapped_column(Integer, nullable=False)
    light: Mapped[str] = mapped_column(String(60), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(30), nullable=False)
    care_tip: Mapped[str] = mapped_column(Text, nullable=False)
