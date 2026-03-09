"""Compare routes — side-by-side brand comparison."""

from fastapi import APIRouter
from routes.brands import _PRELOADED
from db.mongo import get_voice_fingerprint

router = APIRouter(prefix="/api/compare", tags=["compare"])


def _get_fingerprint_for(brand_name: str) -> dict | None:
    """Resolve fingerprint from preloaded data or DB."""
    for key, data in _PRELOADED.items():
        if data["metadata"]["brand_name"].lower() == brand_name.lower():
            return data["voice_fingerprint"]
    fp_doc = get_voice_fingerprint(brand_name)
    return fp_doc.get("fingerprint") if fp_doc else None


@router.get("")
def compare_brands(brand_a: str, brand_b: str):
    """Return voice fingerprints for two brands side-by-side."""
    fp_a = _get_fingerprint_for(brand_a)
    fp_b = _get_fingerprint_for(brand_b)

    if not fp_a:
        return {"error": f"No fingerprint found for '{brand_a}'"}
    if not fp_b:
        return {"error": f"No fingerprint found for '{brand_b}'"}

    # Compute tone deltas
    tone_a = fp_a.get("tone_spectrum", {})
    tone_b = fp_b.get("tone_spectrum", {})
    deltas = {}
    for key in ["formal_casual", "serious_humorous", "reserved_enthusiastic", "corporate_conversational"]:
        val_a = tone_a.get(key, 5)
        val_b = tone_b.get(key, 5)
        deltas[key] = val_b - val_a

    return {
        "brand_a": {
            "name": brand_a,
            "fingerprint": fp_a,
        },
        "brand_b": {
            "name": brand_b,
            "fingerprint": fp_b,
        },
        "tone_deltas": deltas,
    }
