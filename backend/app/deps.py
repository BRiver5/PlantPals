"""Shared FastAPI dependencies."""
from __future__ import annotations

from fastapi import Header, HTTPException, status


async def device_uuid(x_device_id: str | None = Header(default=None)) -> str:
    """Require a non-empty X-Device-Id header identifying the anonymous device."""
    if not x_device_id or not x_device_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Device-Id header.",
        )
    value = x_device_id.strip()
    if len(value) > 64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Device-Id too long.",
        )
    return value
