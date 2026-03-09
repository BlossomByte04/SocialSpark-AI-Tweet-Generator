"""Export utilities for CSV and text."""

import io
import pandas as pd


def tweets_to_csv(tweets: list[dict], brand_name: str) -> str:
    """Convert tweets list to a CSV string for download."""
    rows = []
    for t in tweets:
        rows.append({
            "Brand": brand_name,
            "Tweet #": t.get("id", ""),
            "Tweet Text": t.get("text", ""),
            "Style": t.get("style", ""),
            "Engagement Score": t.get("engagement_score", ""),
            "Engagement Reason": t.get("engagement_reason", ""),
            "Characters": t.get("char_count", len(t.get("text", ""))),
        })
    df = pd.DataFrame(rows)
    return df.to_csv(index=False)


def voice_summary_to_text(fingerprint: dict) -> str:
    """Convert a voice fingerprint to a readable text summary."""
    lines = []
    brand = fingerprint.get("brand_name", "Brand")
    lines.append(f"BRAND VOICE FINGERPRINT — {brand}")
    lines.append("=" * 50)

    for bullet in fingerprint.get("summary_bullets", []):
        lines.append(f"• {bullet}")
    lines.append("")

    arch = fingerprint.get("personality_archetype", "")
    reason = fingerprint.get("archetype_reason", "")
    lines.append(f"Personality Archetype: {arch}")
    if reason:
        lines.append(f"  → {reason}")
    lines.append("")

    spectrum = fingerprint.get("tone_spectrum", {})
    labels = {
        "formal_casual": "Formal ↔ Casual",
        "serious_humorous": "Serious ↔ Humorous",
        "reserved_enthusiastic": "Reserved ↔ Enthusiastic",
        "corporate_conversational": "Corporate ↔ Conversational",
    }
    lines.append("Tone Spectrum:")
    for key, label in labels.items():
        val = spectrum.get(key, "?")
        lines.append(f"  {label}: {val}/10")
    lines.append("")

    vocab = fingerprint.get("vocabulary", {})
    lines.append(f"Vocabulary: {vocab.get('complexity', '')} complexity, {vocab.get('jargon_level', '')} jargon")
    lines.append(f"  Power words: {', '.join(vocab.get('power_words', []))}")
    lines.append(f"  Avoid: {', '.join(vocab.get('avoid_words', []))}")
    lines.append("")

    themes = fingerprint.get("content_themes", [])
    lines.append("Content Themes: " + " | ".join(themes))
    lines.append("")

    lines.append(f"CTA Style: {fingerprint.get('cta_style', '')} — {fingerprint.get('cta_example', '')}")
    lines.append(f"Audience: {fingerprint.get('audience_relationship', '')}")
    lines.append(f"Sentence Style: {fingerprint.get('sentence_style', '')}")

    return "\n".join(lines)


def full_export_text(fingerprint: dict, tweets: list[dict], brand_name: str) -> str:
    """Create a complete text export with voice summary + tweets."""
    parts = []
    parts.append(voice_summary_to_text(fingerprint))
    parts.append("")
    parts.append("=" * 50)
    parts.append(f"GENERATED TWEETS — {brand_name}")
    parts.append("=" * 50)
    parts.append("")
    for t in tweets:
        tid = t.get("id", "")
        style = t.get("style", "")
        score = t.get("engagement_score", "")
        text = t.get("text", "")
        parts.append(f"Tweet #{tid} [{style}] (Score: {score}/10)")
        parts.append(text)
        parts.append("")
    return "\n".join(parts)
