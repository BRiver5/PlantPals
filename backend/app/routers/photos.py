"""Photo upload endpoint. Stores validated images on disk and returns a URL."""
from __future__ import annotations

import io
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from PIL import Image, UnidentifiedImageError

from ..config import settings
from ..deps import device_uuid
from ..schemas import PhotoUploadOut

router = APIRouter(prefix="/photos", tags=["photos"])

_EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
_MAX_DIM = 1600  # downscale longest side to keep files small


@router.post("", response_model=PhotoUploadOut, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    request: Request,
    file: UploadFile,
    device: str = Depends(device_uuid),
) -> PhotoUploadOut:
    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {file.content_type}.",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file.")
    if len(raw) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds the maximum allowed size.",
        )

    # Validate + normalise the image by re-encoding it (strips metadata, prevents bad payloads).
    try:
        image = Image.open(io.BytesIO(raw))
        image.load()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File is not a valid image."
        )

    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    image.thumbnail((_MAX_DIM, _MAX_DIM))

    ext = _EXT.get(file.content_type, ".jpg")
    save_as_png = ext == ".png" and image.mode == "RGBA"
    fmt = "PNG" if save_as_png else "JPEG"
    ext = ".png" if save_as_png else ".jpg"
    if fmt == "JPEG" and image.mode == "RGBA":
        image = image.convert("RGB")

    filename = f"{secrets.token_urlsafe(16)}{ext}"
    dest = settings.upload_dir / filename
    image.save(dest, format=fmt, quality=85)

    base = settings.public_base_url.rstrip("/") or str(request.base_url).rstrip("/")
    return PhotoUploadOut(photo_url=f"{base}/uploads/{filename}")
