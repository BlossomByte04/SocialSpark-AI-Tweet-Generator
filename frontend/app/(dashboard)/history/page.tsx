"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getHistory } from "@/lib/api-client";
import type { Generation } from "@/types/tweet-generator";
import { BRAND_DISPLAY } from "@/types/tweet-generator";
import { TweetList } from "@/components/dashboard/tweet-card";
import { VoiceFingerprintPanel } from "@/components/dashboard/voice-fingerprint";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Twitter,
  Sparkles,
} from "lucide-react";

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getHistory()
      .then(setGenerations)
      .catch(() => setGenerations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Generation History</h1>
        <p className="text-sm text-muted-foreground">
          Browse past tweet generation runs stored in MongoDB.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && generations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Clock className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">
            No generations found. Generate some tweets first!
          </p>
          <p className="text-xs mt-1">
            Make sure MongoDB is running to persist history.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {generations.map((gen) => {
          const key =
            gen.brand_name.toLowerCase().replace(/\s+/g, "_");
          const display = BRAND_DISPLAY[key];
          const isExpanded = expanded === gen._id;

          return (
            <Card key={gen._id}>
              <CardContent className="p-0">
                {/* Summary row */}
                <button
                  onClick={() =>
                    setExpanded(isExpanded ? null : gen._id)
                  }
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30"
                >
                  {display?.logo ? (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={display.logo}
                        alt={gen.brand_name}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl">
                      {display?.emoji || "🏢"}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {gen.brand_name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {gen.source}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                      >
                        {gen.provider}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {gen.campaign_objective}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Twitter className="h-3 w-3" />
                      {gen.tweet_count}
                    </span>
                    <span>{formatDate(gen.created_at)}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {gen.voice_fingerprint && (
                      <>
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Voice Fingerprint
                        </h3>
                        <VoiceFingerprintPanel
                          fingerprint={gen.voice_fingerprint}
                        />
                        <Separator />
                      </>
                    )}
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-primary" />
                      Tweets
                    </h3>
                    <TweetList tweets={gen.tweets || []} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
