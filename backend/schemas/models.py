"""Pydantic request / response models for the API."""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Any


# ── Requests ──────────────────────────────────────────────────────────────

class BrandInput(BaseModel):
    brand_name: str
    industry: str
    campaign_objective: str
    products: str = ""
    sample_posts: str | None = None


class GenerateRequest(BaseModel):
    brand: BrandInput
    provider: str = "gemini"
    api_key: str = ""


class CompareRequest(BaseModel):
    brand_a: str
    brand_b: str


class ProviderSettings(BaseModel):
    provider: str = "gemini"
    api_key: str = ""


# ── Responses ─────────────────────────────────────────────────────────────

class ToneSpectrum(BaseModel):
    formal_casual: int = 5
    serious_humorous: int = 5
    reserved_enthusiastic: int = 5
    corporate_conversational: int = 5


class Vocabulary(BaseModel):
    complexity: str = "Moderate"
    jargon_level: str = "Light"
    power_words: list[str] = []
    avoid_words: list[str] = []


class HashtagStrategy(BaseModel):
    frequency: str = "1-2 per post"
    style: str = "Mixed"
    suggested: list[str] = []


class EmojiUsage(BaseModel):
    frequency: str = "Moderate"
    preferred: list[str] = []


class EmotionalDrivers(BaseModel):
    primary: str = ""
    secondary: str = ""


class VoiceFingerprint(BaseModel):
    brand_name: str = ""
    summary_bullets: list[str] = []
    tone_spectrum: ToneSpectrum = ToneSpectrum()
    personality_archetype: str = ""
    archetype_reason: str = ""
    vocabulary: Vocabulary = Vocabulary()
    emotional_drivers: EmotionalDrivers = EmotionalDrivers()
    content_themes: list[str] = []
    cta_style: str = ""
    cta_example: str = ""
    hashtag_strategy: HashtagStrategy = HashtagStrategy()
    emoji_usage: EmojiUsage = EmojiUsage()
    audience_relationship: str = ""
    sentence_style: str = ""


class Tweet(BaseModel):
    id: int = 0
    text: str
    style: str = "Conversational"
    engagement_score: int = 5
    engagement_reason: str = ""
    char_count: int = 0


class GenerationResult(BaseModel):
    generation_id: str | None = None
    brand_name: str
    campaign_objective: str
    provider: str
    source: str = "live"
    voice_fingerprint: dict[str, Any]
    tweets: list[dict[str, Any]]


class BrandInfo(BaseModel):
    brand_name: str
    industry: str
    products: str = ""
    campaign_objective: str = ""


class CompareResult(BaseModel):
    brand_a: dict[str, Any]
    brand_b: dict[str, Any]


class StatsResponse(BaseModel):
    brands: int = 0
    generations: int = 0
    tweets: int = 0
    connected: bool = False


class HealthResponse(BaseModel):
    status: str
    mongo: bool
    version: str = "2.0.0"
