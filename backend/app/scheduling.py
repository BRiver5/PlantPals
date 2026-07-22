"""Watering-schedule helpers shared by the routers."""
from __future__ import annotations

from datetime import datetime, timedelta

from .models import Plant


def compute_next_due(anchor: datetime, interval_days: int) -> datetime:
    """Next due date = anchor + interval. Anchor is last_watered_at (or creation time)."""
    return anchor + timedelta(days=interval_days)


def apply_watering(plant: Plant, watered_at: datetime) -> None:
    """Update a plant's last-watered and next-due timestamps for a watering event."""
    plant.last_watered_at = watered_at
    plant.next_due_at = compute_next_due(watered_at, plant.interval_days)
