"""Brand-related API routes."""

from fastapi import APIRouter
from db.mongo import list_brands, get_brand, upsert_brand, get_voice_fingerprint
from schemas.models import BrandInfo

import json
from pathlib import Path

router = APIRouter(prefix="/api/brands", tags=["brands"])

# Load preloaded data once at import time
_PRELOADED_PATH = Path(__file__).parent.parent / "examples" / "brands_preloaded.json"
_PRELOADED: dict = {}
if _PRELOADED_PATH.exists():
    _PRELOADED = json.loads(_PRELOADED_PATH.read_text(encoding="utf-8"))


@router.get("")
def get_all_brands():
    """Return all brands — merges preloaded data with DB brands."""
    brands = []

    # Always include preloaded brands
    for key, data in _PRELOADED.items():
        meta = data["metadata"]
        brands.append({
            "brand_name": meta["brand_name"],
            "industry": meta["industry"],
            "products": meta.get("products", ""),
            "campaign_objective": meta.get("campaign_objective", ""),
            "source": "preloaded",
            "has_fingerprint": True,
            "has_tweets": len(data.get("tweets", [])) > 0,
        })

    # Add DB-only brands (not in preloaded)
    preloaded_names = {d["metadata"]["brand_name"].lower() for d in _PRELOADED.values()}
    db_brands = list_brands()
    for b in db_brands:
        if b["brand_name"].lower() not in preloaded_names:
            fp = get_voice_fingerprint(b["brand_name"])
            brands.append({
                **b,
                "source": "custom",
                "has_fingerprint": fp is not None,
                "has_tweets": False,
            })

    return brands


@router.get("/{brand_name}")
def get_single_brand(brand_name: str):
    """Return full brand info including preloaded data if available."""
    # Check preloaded first
    for key, data in _PRELOADED.items():
        if data["metadata"]["brand_name"].lower() == brand_name.lower():
            return {
                "metadata": data["metadata"],
                "voice_fingerprint": data["voice_fingerprint"],
                "tweets": data["tweets"],
                "source": "preloaded",
            }

    # Fall back to DB
    brand = get_brand(brand_name)
    if not brand:
        return {"error": "Brand not found"}, 404

    fp_doc = get_voice_fingerprint(brand_name)
    return {
        "metadata": brand,
        "voice_fingerprint": fp_doc.get("fingerprint") if fp_doc else None,
        "tweets": [],
        "source": "database",
    }


@router.get("/{brand_name}/fingerprint")
def get_brand_fingerprint(brand_name: str):
    """Return just the voice fingerprint for a brand."""
    # Check preloaded
    for key, data in _PRELOADED.items():
        if data["metadata"]["brand_name"].lower() == brand_name.lower():
            return data["voice_fingerprint"]

    fp_doc = get_voice_fingerprint(brand_name)
    if fp_doc:
        return fp_doc.get("fingerprint", {})
    return {}


@router.get("/{brand_name}/tweets")
def get_brand_tweets(brand_name: str):
    """Return preloaded tweets for a brand."""
    for key, data in _PRELOADED.items():
        if data["metadata"]["brand_name"].lower() == brand_name.lower():
            return data["tweets"]
    return []
