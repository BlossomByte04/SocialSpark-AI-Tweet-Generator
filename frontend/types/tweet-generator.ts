/* TypeScript interfaces for Social Spark AI */

export interface BrandInput {
  brand_name: string;
  industry: string;
  campaign_objective: string;
  products: string;
  sample_posts?: string | null;
}

export interface BrandListItem {
  brand_name: string;
  industry: string;
  products: string;
  campaign_objective: string;
  source: "preloaded" | "custom";
  has_fingerprint: boolean;
  has_tweets: boolean;
}

export interface ToneSpectrum {
  formal_casual: number;
  serious_humorous: number;
  reserved_enthusiastic: number;
  corporate_conversational: number;
}

export interface Vocabulary {
  complexity: string;
  jargon_level: string;
  power_words: string[];
  avoid_words: string[];
}

export interface HashtagStrategy {
  frequency: string;
  style: string;
  suggested: string[];
}

export interface EmojiUsage {
  frequency: string;
  preferred: string[];
}

export interface EmotionalDrivers {
  primary: string;
  secondary: string;
}

export interface VoiceFingerprint {
  brand_name: string;
  summary_bullets: string[];
  tone_spectrum: ToneSpectrum;
  personality_archetype: string;
  archetype_reason: string;
  vocabulary: Vocabulary;
  emotional_drivers: EmotionalDrivers;
  content_themes: string[];
  cta_style: string;
  cta_example: string;
  hashtag_strategy: HashtagStrategy;
  emoji_usage: EmojiUsage;
  audience_relationship: string;
  sentence_style: string;
}

export interface Tweet {
  id: number;
  text: string;
  style: string;
  engagement_score: number;
  engagement_reason: string;
  char_count: number;
}

export interface GenerationResult {
  generation_id: string | null;
  brand_name: string;
  campaign_objective: string;
  provider: string;
  source: "preloaded" | "cached" | "live";
  voice_fingerprint: VoiceFingerprint;
  tweets: Tweet[];
}

export interface GenerateRequest {
  brand: BrandInput;
  provider: string;
  api_key: string;
}

export interface CompareResult {
  brand_a: {
    name: string;
    fingerprint: VoiceFingerprint;
  };
  brand_b: {
    name: string;
    fingerprint: VoiceFingerprint;
  };
  tone_deltas: Record<string, number>;
}

export interface Generation {
  _id: string;
  brand_name: string;
  campaign_objective: string;
  provider: string;
  source: string;
  voice_fingerprint: VoiceFingerprint;
  tweets: Tweet[];
  tweet_count: number;
  created_at: string;
}

export interface Stats {
  brands: number;
  generations: number;
  tweets: number;
  connected: boolean;
}

export interface HealthCheck {
  status: string;
  mongo: boolean;
  version: string;
}

// Brand-specific display data
export interface BrandDisplayInfo {
  emoji: string;
  color: string;
  tagline: string;
  logo: string;
}

export const BRAND_DISPLAY: Record<string, BrandDisplayInfo> = {
  confluencr: { emoji: "🤝", color: "#6366F1", tagline: "Influencer Marketing", logo: "/logos/confluencr.png" },
  walnut_folks: { emoji: "🌰", color: "#FF6B35", tagline: "Creative Agency", logo: "/logos/walnut_folks.png" },
  zomato: { emoji: "🍕", color: "#E23744", tagline: "Food Delivery", logo: "/logos/zomato.png" },
  swiggy: { emoji: "🛵", color: "#FC8019", tagline: "Instant Everything", logo: "/logos/swiggy.png" },
  nike: { emoji: "👟", color: "#111111", tagline: "Just Do It", logo: "/logos/nike.png" },
  apple: { emoji: "🍎", color: "#A2AAAD", tagline: "Think Different", logo: "/logos/apple.png" },
  duolingo: { emoji: "🦉", color: "#58CC02", tagline: "Language Learning", logo: "/logos/duolingo.png" },
  amul: { emoji: "🧈", color: "#ED1C24", tagline: "Taste of India", logo: "/logos/amul.png" },
  netflix_india: { emoji: "🎬", color: "#E50914", tagline: "Stream & Chill", logo: "/logos/netflix_india.png" },
  boat: { emoji: "🎧", color: "#1A1A2E", tagline: "Audio Revolution", logo: "/logos/boat.png" },
};
