"""Local caching for API results."""

import hashlib
import json
import os
from pathlib import Path

CACHE_DIR = Path("tweet_cache")


def _get_cache_key(brand: str, objective: str, cache_type: str) -> str:
    """Generate a deterministic cache key from inputs."""
    raw = f"{brand.lower().strip()}:{objective.lower().strip()}:{cache_type}"
    return hashlib.md5(raw.encode()).hexdigest()


def get_cached(brand: str, objective: str, cache_type: str = "tweets") -> dict | None:
    """Retrieve cached result if it exists."""
    key = _get_cache_key(brand, objective, cache_type)
    path = CACHE_DIR / f"{key}.json"
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return None
    return None


def save_to_cache(
    brand: str, objective: str, data: dict | list, cache_type: str = "tweets"
) -> None:
    """Save a result to the local cache."""
    CACHE_DIR.mkdir(exist_ok=True)
    key = _get_cache_key(brand, objective, cache_type)
    path = CACHE_DIR / f"{key}.json"
    try:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError:
        pass


def clear_cache() -> int:
    """Remove all cached files. Returns count of files removed."""
    if not CACHE_DIR.exists():
        return 0
    count = 0
    for f in CACHE_DIR.glob("*.json"):
        f.unlink()
        count += 1
    return count
