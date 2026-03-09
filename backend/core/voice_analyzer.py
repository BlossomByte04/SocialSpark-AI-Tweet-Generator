"""Brand voice analysis engine — Gemini-first with OpenAI fallback."""

import json
import time
from openai import OpenAI
from prompts.voice_prompts import (
    VOICE_ANALYSIS_SYSTEM,
    VOICE_ANALYSIS_USER,
    VOICE_FROM_POSTS_USER,
)


# ---------------------------------------------------------------------------
# Gemini model priority list (ordered by best free-tier quota)
# ---------------------------------------------------------------------------
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3-flash",
]

OPENAI_MODELS = [
    "gpt-4o-mini",
    "gpt-4o",
]

MIN_REQUEST_INTERVAL = 12
_last_request_time: dict[str, float] = {}


def _get_client(provider: str, api_key: str) -> OpenAI:
    """Return an OpenAI-compatible client for the chosen provider."""
    if provider == "gemini":
        return OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
    else:
        return OpenAI(api_key=api_key)


def _rate_limit_wait(model: str) -> None:
    """Enforce minimum interval between requests to the same model."""
    now = time.time()
    last = _last_request_time.get(model, 0)
    wait = max(0, MIN_REQUEST_INTERVAL - (now - last))
    if wait > 0:
        time.sleep(wait)
    _last_request_time[model] = time.time()


def _call_llm(
    client: OpenAI,
    models: list[str],
    system: str,
    user: str,
    max_retries: int = 2,
) -> str:
    """Try each model in priority order; return the first successful response."""
    last_error = None
    for model in models:
        for attempt in range(max_retries):
            try:
                _rate_limit_wait(model)
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    temperature=0.7,
                )
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                if "429" in err_str or "rate" in err_str or "quota" in err_str:
                    wait = (attempt + 1) * 15
                    time.sleep(wait)
                    continue
                break
    raise RuntimeError(f"All models failed. Last error: {last_error}")


def _clean_json_response(raw: str) -> str:
    """Strip markdown fences if the model wraps its JSON in ```."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)
    return text.strip()


def analyze_brand_voice(
    brand_name: str,
    industry: str,
    campaign_objective: str,
    products: str,
    sample_posts: str | None,
    provider: str,
    api_key: str,
) -> dict:
    """Analyze a brand and return a structured voice fingerprint dict."""
    client = _get_client(provider, api_key)
    models = GEMINI_MODELS if provider == "gemini" else OPENAI_MODELS

    if sample_posts and sample_posts.strip():
        user_prompt = VOICE_FROM_POSTS_USER.format(
            brand_name=brand_name,
            industry=industry,
            campaign_objective=campaign_objective,
            sample_posts=sample_posts,
        )
    else:
        sample_section = ""
        if sample_posts and sample_posts.strip():
            sample_section = f"\n- Sample Social Media Posts:\n{sample_posts}"
        user_prompt = VOICE_ANALYSIS_USER.format(
            brand_name=brand_name,
            industry=industry,
            campaign_objective=campaign_objective,
            products=products,
            sample_posts_section=sample_section,
        )

    raw = _call_llm(client, models, VOICE_ANALYSIS_SYSTEM, user_prompt)
    cleaned = _clean_json_response(raw)

    try:
        fingerprint = json.loads(cleaned)
    except json.JSONDecodeError:
        fix_prompt = f"The following is broken JSON. Fix it and return ONLY valid JSON:\n{cleaned}"
        raw2 = _call_llm(client, models, "Fix this JSON.", fix_prompt)
        fingerprint = json.loads(_clean_json_response(raw2))

    return fingerprint
