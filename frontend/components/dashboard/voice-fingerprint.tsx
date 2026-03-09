"use client";

import type { VoiceFingerprint } from "@/types/tweet-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TONE_LABELS: Record<string, [string, string]> = {
  formal_casual: ["Formal", "Casual"],
  serious_humorous: ["Serious", "Humorous"],
  reserved_enthusiastic: ["Reserved", "Enthusiastic"],
  corporate_conversational: ["Corporate", "Conversational"],
};

function ToneBar({
  label,
  value,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}) {
  // Center-pivot bar: 5 is center
  const pct = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{leftLabel}</span>
        <span className="font-medium tabular-nums">{value}/10</span>
        <span className="text-muted-foreground">{rightLabel}</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
        {/* Value marker */}
        <div
          className="absolute top-0 h-full w-3 rounded-full bg-primary transition-all"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  );
}

export function VoiceFingerprintPanel({
  fingerprint,
}: {
  fingerprint: VoiceFingerprint;
}) {
  const tone = fingerprint.tone_spectrum || {};
  const vocab = fingerprint.vocabulary || {};
  const hashtags = fingerprint.hashtag_strategy || {};
  const emoji = fingerprint.emoji_usage || {};
  const drivers = fingerprint.emotional_drivers || {};

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Summary */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-lg">🎭</span>
            {fingerprint.personality_archetype || "Archetype"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {fingerprint.archetype_reason && (
            <p className="text-sm text-muted-foreground italic">
              {fingerprint.archetype_reason}
            </p>
          )}
          <ul className="space-y-1">
            {(fingerprint.summary_bullets || []).map((b, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-primary">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tone Spectrum */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tone Spectrum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(TONE_LABELS).map(([key, [left, right]]) => (
            <ToneBar
              key={key}
              label={key}
              value={(tone as unknown as Record<string, number>)[key] || 5}
              leftLabel={left}
              rightLabel={right}
            />
          ))}
        </CardContent>
      </Card>

      {/* Vocabulary & Style */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vocabulary & Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {vocab.complexity || "Moderate"} complexity
            </Badge>
            <Badge variant="secondary">
              {vocab.jargon_level || "Light"} jargon
            </Badge>
            <Badge variant="secondary">
              {fingerprint.sentence_style || "Balanced"}
            </Badge>
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Power Words
            </p>
            <div className="flex flex-wrap gap-1">
              {(vocab.power_words || []).map((w) => (
                <Badge key={w} variant="outline" className="text-[10px]">
                  {w}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Avoid
            </p>
            <div className="flex flex-wrap gap-1">
              {(vocab.avoid_words || []).map((w) => (
                <Badge
                  key={w}
                  variant="outline"
                  className="border-destructive/30 text-[10px] text-destructive"
                >
                  {w}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Content Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">
              Emotional Drivers
            </span>
            <p>
              {drivers.primary}
              {drivers.secondary ? ` · ${drivers.secondary}` : ""}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Themes</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(fingerprint.content_themes || []).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">CTA Style</span>
            <p>
              {fingerprint.cta_style}
              {fingerprint.cta_example
                ? ` — "${fingerprint.cta_example}"`
                : ""}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Audience</span>
            <p>{fingerprint.audience_relationship}</p>
          </div>
        </CardContent>
      </Card>

      {/* Hashtags & Emoji */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Hashtags & Emoji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">
              Hashtag Strategy
            </span>
            <p>
              {hashtags.frequency} · {hashtags.style}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {(hashtags.suggested || []).map((h) => (
                <Badge key={h} className="text-[10px]">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <span className="text-xs text-muted-foreground">Emoji Usage</span>
            <p>{emoji.frequency}</p>
            <span className="text-lg">
              {(emoji.preferred || []).join(" ")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
