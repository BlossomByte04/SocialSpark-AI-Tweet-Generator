"""MongoDB integration — stores brands, voice fingerprints, tweets, and generation history.

Collections
-----------
brands           — brand metadata (name, industry, products, …)
voice_prints     — 12-dimension voice fingerprints linked to a brand
tweets           — individual generated tweets linked to a generation run
generations      — each generation run (timestamp, provider, brand, objective)

All writes are fire-and-forget (best-effort) so the app never breaks if Mongo is
unavailable.  Reads fall back to None / [] gracefully.
"""

from __future__ import annotations

import os
import datetime as dt
from functools import lru_cache
from typing import Any

from pymongo import MongoClient, errors as mongo_errors
from bson import ObjectId


# ---------------------------------------------------------------------------
# Connection (cached for the process lifetime)
# ---------------------------------------------------------------------------

_MONGO_URI_DEFAULT = "mongodb://localhost:27017"
_DB_NAME = "social_spark_ai"

_client_instance: MongoClient | None = None
_client_checked = False


def _get_client() -> MongoClient | None:
    """Return a shared MongoClient, or None if connection fails."""
    global _client_instance, _client_checked
    if _client_checked:
        return _client_instance
    uri = os.getenv("MONGO_URI", _MONGO_URI_DEFAULT)
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        _client_instance = client
    except Exception:
        _client_instance = None
    _client_checked = True
    return _client_instance


def get_db():
    """Return the database handle, or None."""
    client = _get_client()
    return client[_DB_NAME] if client else None


def is_connected() -> bool:
    """Quick health check."""
    return _get_client() is not None


# ---------------------------------------------------------------------------
# Helper: make ObjectId JSON-safe
# ---------------------------------------------------------------------------

def _clean(doc: dict | None) -> dict | None:
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def _clean_many(cursor) -> list[dict]:
    return [_clean(d) for d in cursor]


# ===================================================================
# BRANDS
# ===================================================================

def upsert_brand(brand_name: str, industry: str, products: str,
                 campaign_objective: str, extra: dict | None = None) -> str | None:
    db = get_db()
    if db is None:
        return None
    try:
        doc = {
            "brand_name": brand_name,
            "industry": industry,
            "products": products,
            "campaign_objective": campaign_objective,
            "updated_at": dt.datetime.utcnow(),
        }
        if extra:
            doc.update(extra)
        result = db.brands.update_one(
            {"brand_name": brand_name},
            {"$set": doc, "$setOnInsert": {"created_at": dt.datetime.utcnow()}},
            upsert=True,
        )
        return str(result.upserted_id or
                    db.brands.find_one({"brand_name": brand_name})["_id"])
    except Exception:
        return None


def get_brand(brand_name: str) -> dict | None:
    db = get_db()
    if db is None:
        return None
    try:
        return _clean(db.brands.find_one({"brand_name": brand_name}))
    except Exception:
        return None


def list_brands() -> list[dict]:
    db = get_db()
    if db is None:
        return []
    try:
        return _clean_many(db.brands.find().sort("brand_name", 1))
    except Exception:
        return []


# ===================================================================
# VOICE FINGERPRINTS
# ===================================================================

def save_voice_fingerprint(brand_name: str, fingerprint: dict,
                           provider: str = "preloaded") -> str | None:
    db = get_db()
    if db is None:
        return None
    try:
        doc = {
            "brand_name": brand_name,
            "fingerprint": fingerprint,
            "provider": provider,
            "created_at": dt.datetime.utcnow(),
        }
        result = db.voice_prints.update_one(
            {"brand_name": brand_name},
            {"$set": doc},
            upsert=True,
        )
        return str(result.upserted_id or
                    db.voice_prints.find_one({"brand_name": brand_name})["_id"])
    except Exception:
        return None


def get_voice_fingerprint(brand_name: str) -> dict | None:
    db = get_db()
    if db is None:
        return None
    try:
        doc = db.voice_prints.find_one({"brand_name": brand_name})
        return _clean(doc) if doc else None
    except Exception:
        return None


# ===================================================================
# GENERATIONS
# ===================================================================

def save_generation(
    brand_name: str,
    campaign_objective: str,
    provider: str,
    voice_fingerprint: dict,
    tweets: list[dict],
    source: str = "live",
) -> str | None:
    db = get_db()
    if db is None:
        return None
    try:
        doc = {
            "brand_name": brand_name,
            "campaign_objective": campaign_objective,
            "provider": provider,
            "source": source,
            "voice_fingerprint": voice_fingerprint,
            "tweets": tweets,
            "tweet_count": len(tweets),
            "created_at": dt.datetime.utcnow(),
        }
        result = db.generations.insert_one(doc)
        return str(result.inserted_id)
    except Exception:
        return None


def get_generations(brand_name: str | None = None,
                    limit: int = 50) -> list[dict]:
    db = get_db()
    if db is None:
        return []
    try:
        query = {"brand_name": brand_name} if brand_name else {}
        cursor = db.generations.find(query).sort("created_at", -1).limit(limit)
        return _clean_many(cursor)
    except Exception:
        return []


def get_generation_by_id(gen_id: str) -> dict | None:
    db = get_db()
    if db is None:
        return None
    try:
        return _clean(db.generations.find_one({"_id": ObjectId(gen_id)}))
    except Exception:
        return None


# ===================================================================
# TWEETS (flat collection)
# ===================================================================

def save_tweets_flat(brand_name: str, generation_id: str,
                     tweets: list[dict]) -> int:
    db = get_db()
    if db is None:
        return 0
    try:
        docs = []
        for t in tweets:
            docs.append({
                "brand_name": brand_name,
                "generation_id": generation_id,
                "tweet_id": t.get("id"),
                "text": t.get("text", ""),
                "style": t.get("style", ""),
                "engagement_score": t.get("engagement_score", 0),
                "engagement_reason": t.get("engagement_reason", ""),
                "char_count": t.get("char_count", len(t.get("text", ""))),
                "created_at": dt.datetime.utcnow(),
            })
        if docs:
            db.tweets.insert_many(docs)
        return len(docs)
    except Exception:
        return 0


def get_tweets_by_brand(brand_name: str, limit: int = 100) -> list[dict]:
    db = get_db()
    if db is None:
        return []
    try:
        cursor = db.tweets.find({"brand_name": brand_name}).sort(
            "created_at", -1
        ).limit(limit)
        return _clean_many(cursor)
    except Exception:
        return []


# ===================================================================
# STATS
# ===================================================================

def get_stats() -> dict[str, Any]:
    db = get_db()
    if db is None:
        return {"brands": 0, "generations": 0, "tweets": 0, "connected": False}
    try:
        return {
            "brands": db.brands.count_documents({}),
            "generations": db.generations.count_documents({}),
            "tweets": db.tweets.count_documents({}),
            "connected": True,
        }
    except Exception:
        return {"brands": 0, "generations": 0, "tweets": 0, "connected": False}


# ===================================================================
# SEED
# ===================================================================

def seed_preloaded(brands_data: dict) -> int:
    """Seed the DB with pre-loaded brand data if brands collection is empty."""
    db = get_db()
    if db is None:
        return 0
    try:
        if db.brands.count_documents({}) > 0:
            return 0
        count = 0
        for key, data in brands_data.items():
            meta = data["metadata"]
            upsert_brand(
                brand_name=meta["brand_name"],
                industry=meta["industry"],
                products=meta.get("products", ""),
                campaign_objective=meta.get("campaign_objective", ""),
            )
            save_voice_fingerprint(meta["brand_name"], data["voice_fingerprint"],
                                   provider="preloaded")
            gen_id = save_generation(
                brand_name=meta["brand_name"],
                campaign_objective=meta.get("campaign_objective", ""),
                provider="preloaded",
                voice_fingerprint=data["voice_fingerprint"],
                tweets=data["tweets"],
                source="preloaded",
            )
            if gen_id:
                save_tweets_flat(meta["brand_name"], gen_id, data["tweets"])
            count += 1
        return count
    except Exception:
        return 0
