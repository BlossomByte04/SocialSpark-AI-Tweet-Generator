"""Tweet generation prompt templates."""

TWEET_GENERATION_SYSTEM = """You are a world-class social media copywriter who perfectly mimics any brand's voice. You create tweets that are indistinguishable from what the brand's actual social media team would post. Every tweet must be under 280 characters. Always return valid JSON."""

TWEET_GENERATION_USER = """Using the Brand Voice Fingerprint below, generate exactly 10 tweets for {brand_name}.

BRAND VOICE FINGERPRINT:
{voice_fingerprint}

CAMPAIGN OBJECTIVE: {campaign_objective}
KEY PRODUCTS/SERVICES: {products}

Generate exactly 10 tweets with this style distribution:
- Tweets 1-3: Conversational / Engaging (relatable, casual, community-building)
- Tweets 4-5: Promotional (product/service focused, clear CTA)
- Tweets 6-7: Witty / Clever (wordplay, humor, meme-energy, memorable)
- Tweets 8-9: Informative / Value-driven (stats, insights, thought leadership)
- Tweet 10: Engagement Bait (question, hot take, or poll prompt)

For EACH tweet, return this JSON structure:
{{
  "tweets": [
    {{
      "id": 1,
      "text": "<tweet text, MUST be under 280 characters>",
      "style": "<Conversational | Promotional | Witty | Informative | Engagement>",
      "engagement_score": <1-10>,
      "engagement_reason": "<one sentence explaining the score>",
      "char_count": <character count of the tweet text>
    }}
  ]
}}

RULES:
- Each tweet MUST be under 280 characters (this is critical)
- Use hashtags and emojis according to the brand's fingerprint
- Make each tweet feel like it was written by the brand's real team
- Ensure variety — no two tweets should feel the same
- Include CTAs where appropriate based on the brand's CTA style

Return ONLY the JSON object, no markdown formatting."""


TWEET_BATCH_USER = """Generate {count} more tweets for {brand_name} in the "{style}" style.

BRAND VOICE FINGERPRINT:
{voice_fingerprint}

CAMPAIGN OBJECTIVE: {campaign_objective}

Generate exactly {count} tweets in the {style} style. Each MUST be under 280 characters.

Return JSON:
{{
  "tweets": [
    {{
      "id": 1,
      "text": "<tweet text>",
      "style": "{style}",
      "engagement_score": <1-10>,
      "engagement_reason": "<reason>",
      "char_count": <count>
    }}
  ]
}}

Return ONLY the JSON object, no markdown formatting."""
