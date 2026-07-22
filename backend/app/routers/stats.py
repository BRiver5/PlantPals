"""Aggregate statistics for a device."""
from __future__ import annotations

from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import device_uuid
from ..models import Plant, WateringLog, utcnow
from ..schemas import StatsOut, WeeklyBucket

router = APIRouter(prefix="/stats", tags=["stats"])

_WEEKS = 8  # number of trailing weeks in the weekly chart


def _monday(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _compute_streak(watered_days: set[date], today: date) -> int:
    """Consecutive days ending today (or yesterday) on which at least one plant was watered."""
    if not watered_days:
        return 0
    cursor = today if today in watered_days else today - timedelta(days=1)
    if cursor not in watered_days:
        return 0
    streak = 0
    while cursor in watered_days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _best_streak(watered_days: set[date]) -> int:
    if not watered_days:
        return 0
    best = current = 1
    ordered = sorted(watered_days)
    for prev, cur in zip(ordered, ordered[1:]):
        if cur - prev == timedelta(days=1):
            current += 1
        else:
            current = 1
        best = max(best, current)
    return best


@router.get("", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), device: str = Depends(device_uuid)) -> StatsOut:
    now = utcnow()
    today = now.date()

    total_plants = db.execute(
        select(func.count()).select_from(Plant).where(Plant.device_uuid == device)
    ).scalar_one()

    waterings_total = db.execute(
        select(func.count()).select_from(WateringLog).where(WateringLog.device_uuid == device)
    ).scalar_one()

    month_start = datetime(now.year, now.month, 1)
    waterings_this_month = db.execute(
        select(func.count())
        .select_from(WateringLog)
        .where(WateringLog.device_uuid == device, WateringLog.watered_at >= month_start)
    ).scalar_one()

    end_of_today = datetime.combine(today, datetime.max.time())
    due_today = db.execute(
        select(func.count())
        .select_from(Plant)
        .where(
            Plant.device_uuid == device,
            Plant.next_due_at >= datetime.combine(today, datetime.min.time()),
            Plant.next_due_at <= end_of_today,
        )
    ).scalar_one()
    overdue = db.execute(
        select(func.count())
        .select_from(Plant)
        .where(
            Plant.device_uuid == device,
            Plant.next_due_at < datetime.combine(today, datetime.min.time()),
        )
    ).scalar_one()

    # All watered dates (for streaks) — pull timestamps and reduce to a set of dates.
    ts_rows = db.execute(
        select(WateringLog.watered_at).where(WateringLog.device_uuid == device)
    ).scalars().all()
    watered_days = {ts.date() for ts in ts_rows}
    current_streak = _compute_streak(watered_days, today)
    best_streak = _best_streak(watered_days)

    # Weekly buckets for the trailing _WEEKS weeks.
    this_monday = _monday(today)
    first_monday = this_monday - timedelta(weeks=_WEEKS - 1)
    counts: dict[date, int] = {}
    for ts in ts_rows:
        wk = _monday(ts.date())
        if wk >= first_monday:
            counts[wk] = counts.get(wk, 0) + 1
    weekly: list[WeeklyBucket] = []
    for i in range(_WEEKS):
        wk = first_monday + timedelta(weeks=i)
        weekly.append(
            WeeklyBucket(
                week_start=wk.isoformat(),
                label=wk.strftime("%b %d"),
                count=counts.get(wk, 0),
            )
        )

    return StatsOut(
        total_plants=total_plants,
        waterings_this_month=waterings_this_month,
        waterings_total=waterings_total,
        due_today=due_today,
        overdue=overdue,
        current_streak=current_streak,
        best_streak=best_streak,
        weekly=weekly,
    )
