"""Tweet generation engine — Gemini-first with OpenAI fallback."""

import json
import time
from openai import OpenAI
from prompts.tweet_prompts import TWEET_GENERATION_SYSTEM, TWEET_GENERATION_USER


# ---------------------------------------------------------------------------
# Model lists (same as voice_analyzer — kept here to avoid circular imports)
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
    if provider == "gemini":
        return OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
    return OpenAI(api_key=api_key)


def _rate_limit_wait(model: str) -> None:
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
                    temperature=0.9,
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
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)
    return text.strip()


def generate_tweets(
    brand_name: str,
    campaign_objective: str,
    products: str,
    voice_fingerprint: dict,
    provider: str,
    api_key: str,
) -> list[dict]:
    """Generate 10 on-brand tweets using the voice fingerprint."""
    client = _get_client(provider, api_key)
    models = GEMINI_MODELS if provider == "gemini" else OPENAI_MODELS

    fp_str = json.dumps(voice_fingerprint, indent=None)

    user_prompt = TWEET_GENERATION_USER.format(
        brand_name=brand_name,
        campaign_objective=campaign_objective,
        products=products,
        voice_fingerprint=fp_str,
    )

    raw = _call_llm(client, models, TWEET_GENERATION_SYSTEM, user_prompt)
    cleaned = _clean_json_response(raw)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        fix_prompt = f"Fix this broken JSON and return ONLY valid JSON:\n{cleaned}"
        raw2 = _call_llm(client, models, "Fix this JSON.", fix_prompt)
        data = json.loads(_clean_json_response(raw2))

    tweets = data.get("tweets", data) if isinstance(data, dict) else data

    validated: list[dict] = []
    for t in tweets:
        if isinstance(t, dict) and "text" in t:
            t["char_count"] = len(t["text"])
            t.setdefault("engagement_score", 5)
            t.setdefault("engagement_reason", "")
            t.setdefault("style", "Conversational")
            validated.append(t)

    return validated
