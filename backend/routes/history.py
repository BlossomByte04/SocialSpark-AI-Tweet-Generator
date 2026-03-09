"""History routes — past generation runs."""

from fastapi import APIRouter, HTTPException
from db.mongo import get_generations, get_generation_by_id
from utils.export import tweets_to_csv, full_export_text

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
def list_generations(brand: str | None = None, limit: int = 50):
    """Return recent generation runs."""
    return get_generations(brand_name=brand, limit=limit)


@router.get("/{generation_id}")
def get_generation(generation_id: str):
    """Return a specific generation by its ID."""
    gen = get_generation_by_id(generation_id)
    if not gen:
        raise HTTPException(status_code=404, detail="Generation not found")
    return gen


@router.get("/{generation_id}/export/csv")
def export_csv(generation_id: str):
    """Export tweets as CSV string."""
    gen = get_generation_by_id(generation_id)
    if not gen:
        raise HTTPException(status_code=404, detail="Generation not found")
    csv_str = tweets_to_csv(gen.get("tweets", []), gen["brand_name"])
    return {"csv": csv_str, "filename": f"{gen['brand_name']}_tweets.csv"}


@router.get("/{generation_id}/export/text")
def export_text(generation_id: str):
    """Export full report as text."""
    gen = get_generation_by_id(generation_id)
    if not gen:
        raise HTTPException(status_code=404, detail="Generation not found")
    text = full_export_text(
        gen.get("voice_fingerprint", {}),
        gen.get("tweets", []),
        gen["brand_name"],
    )
    return {"text": text, "filename": f"{gen['brand_name']}_report.txt"}
