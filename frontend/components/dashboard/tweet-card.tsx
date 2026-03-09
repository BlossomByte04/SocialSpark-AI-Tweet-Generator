"use client";

import type { Tweet } from "@/types/tweet-generator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const STYLE_COLORS: Record<string, string> = {
  Conversational: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Promotional: "bg-green-500/15 text-green-400 border-green-500/30",
  Witty: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Informative: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Engagement: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8 ? "bg-green-500" : score >= 5 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{score}/10</span>
    </div>
  );
}

export function TweetCard({ tweet, index }: { tweet: Tweet; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tweet.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const styleClass = STYLE_COLORS[tweet.style] || STYLE_COLORS.Conversational;

  return (
    <Card className="group relative transition-all hover:border-primary/30">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {index + 1}
            </span>
            <Badge variant="outline" className={`text-[10px] ${styleClass}`}>
              {tweet.style}
            </Badge>
          </div>
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Tweet text */}
        <p className="mb-3 text-sm leading-relaxed">{tweet.text}</p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Engagement</span>
            <ScoreBar score={tweet.engagement_score} />
          </div>
          <span className="tabular-nums">{tweet.char_count}/280</span>
        </div>

        {tweet.engagement_reason && (
          <p className="mt-2 text-[11px] italic text-muted-foreground/70">
            {tweet.engagement_reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TweetList({ tweets }: { tweets: Tweet[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {tweets.map((t, i) => (
        <TweetCard key={t.id || i} tweet={t} index={i} />
      ))}
    </div>
  );
}
