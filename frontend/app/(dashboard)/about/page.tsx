"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Fingerprint,
  Twitter,
  Database,
  Zap,
  Layers,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const PIPELINE_STEPS = [
  {
    icon: Fingerprint,
    title: "1. Brand Voice Fingerprinting",
    description:
      "The system analyzes brand metadata (name, industry, products, campaign objective) or real social media posts to build a 12-dimension Brand Voice Fingerprint.",
    details: [
      "Tone Spectrum (4 axes): Formal↔Casual, Serious↔Humorous, Reserved↔Enthusiastic, Corporate↔Conversational",
      "Personality Archetype: Authority, Friend, Innovator, Storyteller, Challenger, or Guide",
      "Vocabulary profile: complexity, jargon level, power words, avoid words",
      "Emotional drivers, content themes, CTA style, hashtag & emoji strategy",
    ],
  },
  {
    icon: Twitter,
    title: "2. Tweet Generation",
    description:
      "Using the fingerprint, the system generates exactly 10 tweets with a balanced style distribution:",
    details: [
      "3 Conversational (relatable, community-building)",
      "2 Promotional (product-focused, clear CTAs)",
      "2 Witty (wordplay, humor, meme-energy)",
      "2 Informative (stats, insights, thought leadership)",
      "1 Engagement Bait (question, hot take, poll prompt)",
    ],
  },
  {
    icon: Brain,
    title: "3. AI Models",
    description: "Multi-model strategy with automatic fallback and rate limiting:",
    details: [
      "Primary: Gemini 2.5 Flash (6 RPM, 1.1K TPM, 24 RPD — free tier)",
      "Fallback 1: Gemini 3.1 Flash Lite",
      "Fallback 2: Gemini 3 Flash",
      "Alternative: OpenAI GPT-4o-mini / GPT-4o",
      "12-second minimum between requests per model",
      "Exponential backoff on rate limit (429) errors",
    ],
  },
  {
    icon: Database,
    title: "4. Data Layer",
    description: "Three-tier caching strategy ensures zero-API-cost demos:",
    details: [
      "Tier 1: 10 pre-baked brands with full fingerprints + tweets (JSON file)",
      "Tier 2: Local JSON cache (MD5-keyed by brand + objective)",
      "Tier 3: MongoDB persistence (brands, voice_prints, generations, tweets)",
      "All writes are fire-and-forget — app never breaks if MongoDB is unavailable",
    ],
  },
];

const TECH_STACK = [
  { label: "Frontend", value: "Next.js 16 + React 19 + TypeScript" },
  { label: "UI", value: "shadcn/ui + Tailwind CSS v4 + Lucide Icons" },
  { label: "Backend", value: "FastAPI + Pydantic v2" },
  { label: "AI", value: "Gemini 2.5 Flash (via OpenAI-compatible endpoint)" },
  { label: "Database", value: "MongoDB (pymongo)" },
  { label: "Caching", value: "Pre-loaded JSON + Local file cache + MongoDB" },
];

const PRELOADED_BRANDS = [
  "Confluencr",
  "Walnut Folks",
  "Zomato",
  "Swiggy",
  "Nike",
  "Apple",
  "Duolingo",
  "Amul",
  "Netflix India",
  "boAt",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">How It Works</h1>
        <p className="text-sm text-muted-foreground">
          Technical approach document for the Walnut Folks AI & Innovation Trainee assignment.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Built by <strong>Pallavi K</strong>
        </p>
      </div>

      {/* Assignment brief */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Assignment Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>Task:</strong> Build an AI-powered system that can generate{" "}
            <strong>10 on-brand tweets</strong> for any brand, ensuring the
            generated content aligns with the brand's unique voice and style.
          </p>
          <p>
            <strong>Company:</strong> Walnut Folks Private Limited (Confluencr —
            India's largest influencer marketing platform)
          </p>
          <p>
            <strong>Role:</strong> AI & Innovation Trainee
          </p>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Pipeline Architecture
        </h2>
        {PIPELINE_STEPS.map((step, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <step.icon className="h-4 w-4 text-primary" />
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
              <ul className="space-y-1">
                {step.details.map((d, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-xs"
                  >
                    <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Tech stack */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {TECH_STACK.map(({ label, value }) => (
              <div key={label} className="text-sm">
                <span className="text-xs text-muted-foreground">{label}</span>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pre-loaded brands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">10 Pre-loaded Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRELOADED_BRANDS.map((b) => (
              <Badge key={b} variant="secondary">
                {b}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Each brand ships with a complete voice fingerprint and 10
            pre-generated tweets — zero API calls needed for demos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
