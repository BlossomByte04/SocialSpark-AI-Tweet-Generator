"use client";

import { useEffect, useState, useCallback } from "react";
import { getBrands, compareBrands } from "@/lib/api-client";
import type { BrandListItem, CompareResult } from "@/types/tweet-generator";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitCompareArrows,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const TONE_LABELS: Record<string, [string, string]> = {
  formal_casual: ["Formal", "Casual"],
  serious_humorous: ["Serious", "Humorous"],
  reserved_enthusiastic: ["Reserved", "Enthusiastic"],
  corporate_conversational: ["Corporate", "Conversational"],
};

function DeltaBar({
  leftLabel,
  rightLabel,
  valueA,
  valueB,
}: {
  leftLabel: string;
  rightLabel: string;
  valueA: number;
  valueB: number;
}) {
  const pctA = ((valueA - 1) / 9) * 100;
  const pctB = ((valueB - 1) / 9) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-muted">
        <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
        {/* Brand A marker */}
        <div
          className="absolute top-0 h-full w-3 rounded-full bg-blue-500 transition-all"
          style={{ left: `calc(${pctA}% - 6px)` }}
          title={`Brand A: ${valueA}`}
        />
        {/* Brand B marker */}
        <div
          className="absolute top-0 h-full w-3 rounded-full bg-orange-500 transition-all"
          style={{ left: `calc(${pctB}% - 6px)` }}
          title={`Brand B: ${valueB}`}
        />
      </div>
      <div className="flex justify-between text-[10px] tabular-nums">
        <span className="text-blue-400">{valueA}/10</span>
        <span className="text-orange-400">{valueB}/10</span>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [brandA, setBrandA] = useState<string>("");
  const [brandB, setBrandB] = useState<string>("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBrands()
      .then((b) => {
        setBrands(b.filter((x) => x.has_fingerprint));
        if (b.length >= 2) {
          // Auto-select Zomato vs Swiggy if available
          const names = b.map((x) => x.brand_name.toLowerCase());
          if (names.includes("zomato") && names.includes("swiggy")) {
            setBrandA("Zomato");
            setBrandB("Swiggy");
          }
        }
      })
      .catch(() => setBrands([]));
  }, []);

  // Auto-compare when both are selected
  useEffect(() => {
    if (brandA && brandB && brandA !== brandB) {
      setLoading(true);
      setError(null);
      compareBrands(brandA, brandB)
        .then(setResult)
        .catch((e) =>
          setError(e instanceof Error ? e.message : "Comparison failed")
        )
        .finally(() => setLoading(false));
    }
  }, [brandA, brandB]);

  const fpA = result?.brand_a?.fingerprint;
  const fpB = result?.brand_b?.fingerprint;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Compare Brands</h1>
        <p className="text-sm text-muted-foreground">
          Select two brands to see their voice fingerprints side-by-side.
        </p>
      </div>

      {/* Selectors */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <select
            value={brandA}
            onChange={(e) => setBrandA(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Brand A</option>
            {brands.map((b) => (
              <option key={b.brand_name} value={b.brand_name}>
                {b.brand_name}
              </option>
            ))}
          </select>

          <GitCompareArrows className="h-5 w-5 text-muted-foreground" />

          <select
            value={brandB}
            onChange={(e) => setBrandB(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Brand B</option>
            {brands.map((b) => (
              <option key={b.brand_name} value={b.brand_name}>
                {b.brand_name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {result && fpA && fpB && (
        <div className="space-y-6">
          {/* Tone comparison */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                Tone Spectrum Comparison
                <Badge variant="outline" className="text-blue-400">
                  {result.brand_a.name}
                </Badge>
                <span className="text-xs text-muted-foreground">vs</span>
                <Badge variant="outline" className="text-orange-400">
                  {result.brand_b.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {Object.entries(TONE_LABELS).map(([key, [left, right]]) => (
                <DeltaBar
                  key={key}
                  leftLabel={left}
                  rightLabel={right}
                  valueA={
                    (fpA.tone_spectrum as unknown as Record<string, number>)[key] || 5
                  }
                  valueB={
                    (fpB.tone_spectrum as unknown as Record<string, number>)[key] || 5
                  }
                />
              ))}
            </CardContent>
          </Card>

          {/* Side-by-side cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Brand A */}
            <Card className="border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  {result.brand_a.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge>{fpA.personality_archetype}</Badge>
                <p className="italic text-muted-foreground text-xs">
                  {fpA.archetype_reason}
                </p>
                <Separator />
                <p>
                  <span className="text-xs text-muted-foreground">CTA:</span>{" "}
                  {fpA.cta_style}
                </p>
                <p>
                  <span className="text-xs text-muted-foreground">
                    Audience:
                  </span>{" "}
                  {fpA.audience_relationship}
                </p>
                <p>
                  <span className="text-xs text-muted-foreground">
                    Sentence:
                  </span>{" "}
                  {fpA.sentence_style}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(fpA.content_themes || []).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brand B */}
            <Card className="border-orange-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  {result.brand_b.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge>{fpB.personality_archetype}</Badge>
                <p className="italic text-muted-foreground text-xs">
                  {fpB.archetype_reason}
                </p>
                <Separator />
                <p>
                  <span className="text-xs text-muted-foreground">CTA:</span>{" "}
                  {fpB.cta_style}
                </p>
                <p>
                  <span className="text-xs text-muted-foreground">
                    Audience:
                  </span>{" "}
                  {fpB.audience_relationship}
                </p>
                <p>
                  <span className="text-xs text-muted-foreground">
                    Sentence:
                  </span>{" "}
                  {fpB.sentence_style}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(fpB.content_themes || []).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <GitCompareArrows className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Select two brands above to compare their voice fingerprints.</p>
        </div>
      )}
    </div>
  );
}
