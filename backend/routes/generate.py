"""Generate routes — voice analysis + tweet generation."""

from fastapi import APIRouter, HTTPException
from schemas.models import GenerateRequest, GenerationResult
from core.voice_analyzer import analyze_brand_voice
from core.tweet_generator import generate_tweets
from utils.cache import get_cached, save_to_cache
from db.mongo import (
    save_generation,
    save_voice_fingerprint,
    upsert_brand,
    save_tweets_flat,
    get_voice_fingerprint,
)
from routes.brands import _PRELOADED

import json
import os

router = APIRouter(prefix="/api/generate", tags=["generate"])


def _resolve_api_key(provider: str, api_key: str) -> str:
    """Use provided key, fall back to env vars."""
    if api_key:
        return api_key
    if provider == "gemini":
        return os.getenv("GEMINI_API_KEY", "")
    return os.getenv("OPENAI_API_KEY", "")


@router.post("", response_model=GenerationResult)
def generate(req: GenerateRequest):
    """
    Full pipeline: analyze brand voice → generate 10 tweets.
    Uses preloaded data or cache when available, falls back to live API.
    """
    brand = req.brand
    provider = req.provider
    api_key = _resolve_api_key(provider, req.api_key)

    brand_lower = brand.brand_name.lower().strip()

    # ── 1. Try preloaded data ─────────────────────────────────────────
    for key, data in _PRELOADED.items():
        if data["metadata"]["brand_name"].lower() == brand_lower:
            gen_id = save_generation(
                brand_name=brand.brand_name,
                campaign_objective=brand.campaign_objective or data["metadata"].get("campaign_objective", ""),
                provider="preloaded",
                voice_fingerprint=data["voice_fingerprint"],
                tweets=data["tweets"],
                source="preloaded",
            )
            return GenerationResult(
                generation_id=gen_id,
                brand_name=brand.brand_name,
                campaign_objective=brand.campaign_objective or data["metadata"].get("campaign_objective", ""),
                provider="preloaded",
                source="preloaded",
                voice_fingerprint=data["voice_fingerprint"],
                tweets=data["tweets"],
            )

    # ── 2. Try local cache ────────────────────────────────────────────
    cached_voice = get_cached(brand.brand_name, brand.campaign_objective, "voice")
    cached_tweets = get_cached(brand.brand_name, brand.campaign_objective, "tweets")
    if cached_voice and cached_tweets:
        gen_id = save_generation(
            brand_name=brand.brand_name,
            campaign_objective=brand.campaign_objective,
            provider=provider,
            voice_fingerprint=cached_voice,
            tweets=cached_tweets,
            source="cached",
        )
        return GenerationResult(
            generation_id=gen_id,
            brand_name=brand.brand_name,
            campaign_objective=brand.campaign_objective,
            provider=provider,
            source="cached",
            voice_fingerprint=cached_voice,
            tweets=cached_tweets,
        )

    # ── 3. Live API call ──────────────────────────────────────────────
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail=f"No API key provided for {provider}. Set it in settings or provide it in the request.",
        )

    try:
        # Voice analysis
        fingerprint = analyze_brand_voice(
            brand_name=brand.brand_name,
            industry=brand.industry,
            campaign_objective=brand.campaign_objective,
            products=brand.products,
            sample_posts=brand.sample_posts,
            provider=provider,
            api_key=api_key,
        )
        save_to_cache(brand.brand_name, brand.campaign_objective, fingerprint, "voice")

        # Tweet generation
        tweets = generate_tweets(
            brand_name=brand.brand_name,
            campaign_objective=brand.campaign_objective,
            products=brand.products,
            voice_fingerprint=fingerprint,
            provider=provider,
            api_key=api_key,
        )
        save_to_cache(brand.brand_name, brand.campaign_objective, tweets, "tweets")

        # Persist to DB
        upsert_brand(brand.brand_name, brand.industry, brand.products, brand.campaign_objective)
        save_voice_fingerprint(brand.brand_name, fingerprint, provider)
        gen_id = save_generation(
            brand_name=brand.brand_name,
            campaign_objective=brand.campaign_objective,
            provider=provider,
            voice_fingerprint=fingerprint,
            tweets=tweets,
            source="live",
        )
        if gen_id:
            save_tweets_flat(brand.brand_name, gen_id, tweets)

        return GenerationResult(
            generation_id=gen_id,
            brand_name=brand.brand_name,
            campaign_objective=brand.campaign_objective,
            provider=provider,
            source="live",
            voice_fingerprint=fingerprint,
            tweets=tweets,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice-only")
def analyze_voice_only(req: GenerateRequest):
    """Run only the voice analysis step (no tweet generation)."""
    brand = req.brand
    provider = req.provider
    api_key = _resolve_api_key(provider, req.api_key)

    # Check preloaded
    brand_lower = brand.brand_name.lower().strip()
    for key, data in _PRELOADED.items():
        if data["metadata"]["brand_name"].lower() == brand_lower:
            return data["voice_fingerprint"]

    # Check cache
    cached = get_cached(brand.brand_name, brand.campaign_objective, "voice")
    if cached:
        return cached

    if not api_key:
        raise HTTPException(status_code=400, detail=f"No API key for {provider}")

    try:
        fingerprint = analyze_brand_voice(
            brand_name=brand.brand_name,
            industry=brand.industry,
            campaign_objective=brand.campaign_objective,
            products=brand.products,
            sample_posts=brand.sample_posts,
            provider=provider,
            api_key=api_key,
        )
        save_to_cache(brand.brand_name, brand.campaign_objective, fingerprint, "voice")
        save_voice_fingerprint(brand.brand_name, fingerprint, provider)
        return fingerprint
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
