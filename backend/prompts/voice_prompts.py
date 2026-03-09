"""Voice analysis prompt templates."""

VOICE_ANALYSIS_SYSTEM = """You are an expert brand strategist and linguist specializing in social media voice analysis. You analyze brand information and create structured Brand Voice Fingerprints. Always return valid JSON matching the exact schema requested. Be specific and actionable — avoid generic descriptions."""

VOICE_ANALYSIS_USER = """Analyze the following brand and create a detailed Brand Voice Fingerprint.

BRAND INFORMATION:
- Brand Name: {brand_name}
- Industry: {industry}
- Campaign Objective: {campaign_objective}
- Key Products/Services: {products}
{sample_posts_section}

Create a Brand Voice Fingerprint as JSON with this exact structure:
{{
  "brand_name": "{brand_name}",
  "summary_bullets": [
    "bullet 1 — one-line summary of the brand voice",
    "bullet 2 — key tone characteristic",
    "bullet 3 — audience relationship style",
    "bullet 4 — content strategy focus"
  ],
  "tone_spectrum": {{
    "formal_casual": <1-10, 1=very formal, 10=very casual>,
    "serious_humorous": <1-10, 1=very serious, 10=very humorous>,
    "reserved_enthusiastic": <1-10, 1=reserved, 10=enthusiastic>,
    "corporate_conversational": <1-10, 1=corporate, 10=conversational>
  }},
  "personality_archetype": "<one of: The Authority | The Friend | The Innovator | The Storyteller | The Challenger | The Guide>",
  "archetype_reason": "<one sentence explaining why this archetype fits>",
  "vocabulary": {{
    "complexity": "<Simple | Moderate | Sophisticated>",
    "jargon_level": "<None | Light | Heavy>",
    "power_words": ["word1", "word2", "word3", "word4", "word5"],
    "avoid_words": ["word1", "word2", "word3"]
  }},
  "emotional_drivers": {{
    "primary": "<e.g. Confidence, Excitement, Trust, FOMO, Belonging>",
    "secondary": "<e.g. Curiosity, Urgency, Joy, Ambition>"
  }},
  "content_themes": ["theme1", "theme2", "theme3"],
  "cta_style": "<Direct | Soft | Question-based | Urgency-driven>",
  "cta_example": "<example CTA pattern>",
  "hashtag_strategy": {{
    "frequency": "<None | 1-2 per post | 3-5 per post | Heavy>",
    "style": "<Branded | Industry | Trending | Mixed>",
    "suggested": ["#tag1", "#tag2", "#tag3"]
  }},
  "emoji_usage": {{
    "frequency": "<None | Sparse | Moderate | Heavy>",
    "preferred": ["emoji1", "emoji2", "emoji3"]
  }},
  "audience_relationship": "<how the brand speaks to its audience, e.g. Expert mentor, Peer friend, Hype leader>",
  "sentence_style": "<Short punchy | Medium balanced | Long flowing>"
}}

Return ONLY the JSON object, no markdown formatting."""


VOICE_FROM_POSTS_USER = """Analyze the following real social media posts from {brand_name} and create a Brand Voice Fingerprint.

BRAND: {brand_name}
INDUSTRY: {industry}
CAMPAIGN OBJECTIVE: {campaign_objective}

SAMPLE POSTS:
{sample_posts}

Based on these actual posts, create a Brand Voice Fingerprint as JSON with this exact structure:
{{
  "brand_name": "{brand_name}",
  "summary_bullets": [
    "bullet 1 — one-line summary of the brand voice",
    "bullet 2 — key tone characteristic",
    "bullet 3 — audience relationship style",
    "bullet 4 — content strategy focus"
  ],
  "tone_spectrum": {{
    "formal_casual": <1-10>,
    "serious_humorous": <1-10>,
    "reserved_enthusiastic": <1-10>,
    "corporate_conversational": <1-10>
  }},
  "personality_archetype": "<The Authority | The Friend | The Innovator | The Storyteller | The Challenger | The Guide>",
  "archetype_reason": "<one sentence>",
  "vocabulary": {{
    "complexity": "<Simple | Moderate | Sophisticated>",
    "jargon_level": "<None | Light | Heavy>",
    "power_words": ["word1", "word2", "word3", "word4", "word5"],
    "avoid_words": ["word1", "word2", "word3"]
  }},
  "emotional_drivers": {{
    "primary": "<emotion>",
    "secondary": "<emotion>"
  }},
  "content_themes": ["theme1", "theme2", "theme3"],
  "cta_style": "<Direct | Soft | Question-based | Urgency-driven>",
  "cta_example": "<example>",
  "hashtag_strategy": {{
    "frequency": "<None | 1-2 per post | 3-5 per post | Heavy>",
    "style": "<Branded | Industry | Trending | Mixed>",
    "suggested": ["#tag1", "#tag2", "#tag3"]
  }},
  "emoji_usage": {{
    "frequency": "<None | Sparse | Moderate | Heavy>",
    "preferred": ["emoji1", "emoji2", "emoji3"]
  }},
  "audience_relationship": "<description>",
  "sentence_style": "<Short punchy | Medium balanced | Long flowing>"
}}

Return ONLY the JSON object, no markdown formatting."""
