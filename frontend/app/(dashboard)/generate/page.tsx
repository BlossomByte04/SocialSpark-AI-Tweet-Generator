"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getBrands,
  generateTweets,
  exportCSV,
  exportText,
} from "@/lib/api-client";
import type {
  BrandListItem,
  BrandInput,
  GenerationResult,
} from "@/types/tweet-generator";

import { BrandGrid } from "@/components/dashboard/brand-grid";
import { TweetList } from "@/components/dashboard/tweet-card";
import { VoiceFingerprintPanel } from "@/components/dashboard/voice-fingerprint";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Settings,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function GeneratePage() {
  // ── State ────────────────────────────────────────────────────────
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Custom brand form
  const [customName, setCustomName] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customObjective, setCustomObjective] = useState("");
  const [customProducts, setCustomProducts] = useState("");
  const [customPosts, setCustomPosts] = useState("");

  // Settings
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Results
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show custom form
  const [showCustom, setShowCustom] = useState(false);

  // ── Load brands ──────────────────────────────────────────────────
  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  // ── Select preloaded brand ───────────────────────────────────────
  const handleBrandSelect = useCallback((brand: BrandListItem) => {
    setSelectedBrand(brand.brand_name);
    setShowCustom(false);
    setError(null);
    // Auto-fill custom fields for context
    setCustomName(brand.brand_name);
    setCustomIndustry(brand.industry);
    setCustomObjective(brand.campaign_objective);
    setCustomProducts(brand.products);
    setCustomPosts("");
  }, []);

  // ── Generate ─────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const brandInput: BrandInput = {
      brand_name: customName || selectedBrand || "",
      industry: customIndustry,
      campaign_objective: customObjective,
      products: customProducts,
      sample_posts: customPosts || null,
    };

    if (!brandInput.brand_name) {
      setError("Please select a brand or enter a custom brand name.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateTweets({
        brand: brandInput,
        provider,
        api_key: apiKey,
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [
    customName,
    customIndustry,
    customObjective,
    customProducts,
    customPosts,
    selectedBrand,
    provider,
    apiKey,
  ]);

  // ── Export handlers ──────────────────────────────────────────────
  const handleExportCSV = useCallback(async () => {
    if (!result?.generation_id) return;
    try {
      const { csv, filename } = await exportCSV(result.generation_id);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, [result]);

  const handleExportText = useCallback(async () => {
    if (!result?.generation_id) return;
    try {
      const { text, filename } = await exportText(result.generation_id);
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, [result]);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Generate Tweets</h1>
        <p className="text-sm text-muted-foreground">
          Select a brand or enter a custom one, then generate 10 on-brand tweets
          powered by AI.
        </p>
      </div>

      {/* Brand Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Select a Brand</span>
            <Badge variant="secondary" className="text-[10px]">
              {brands.length} available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BrandGrid
            brands={brands}
            selected={selectedBrand}
            onSelect={handleBrandSelect}
          />
          <Separator className="my-4" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowCustom(!showCustom);
              if (!showCustom) setSelectedBrand(null);
            }}
          >
            {showCustom ? "Hide Custom Brand" : "+ Custom Brand"}
          </Button>
        </CardContent>
      </Card>

      {/* Custom Brand Form */}
      {showCustom && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Custom Brand Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Brand Name *"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <Input
                placeholder="Industry *"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
              />
            </div>
            <Input
              placeholder="Campaign Objective *"
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
            />
            <Input
              placeholder="Key Products / Services"
              value={customProducts}
              onChange={(e) => setCustomProducts(e.target.value)}
            />
            <Textarea
              placeholder="Paste sample social media posts (optional — improves accuracy)"
              value={customPosts}
              onChange={(e) => setCustomPosts(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Settings & Generate */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Generating…" : "Generate 10 Tweets"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-1.5 text-muted-foreground"
        >
          <Settings className="h-4 w-4" />
          Provider Settings
          {showSettings ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        {result && (
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportText}
              className="gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Report
            </Button>
          </div>
        )}
      </div>

      {/* Provider settings panel */}
      {showSettings && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="gemini">Gemini (Free)</option>
              <option value="openai">OpenAI</option>
            </select>
            <Input
              type="password"
              placeholder={
                provider === "gemini" ? "Gemini API Key" : "OpenAI API Key"
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="max-w-xs"
            />
            <span className="text-xs text-muted-foreground">
              {provider === "gemini"
                ? "Uses env GEMINI_API_KEY if blank"
                : "Uses env OPENAI_API_KEY if blank"}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Source badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={result.source === "live" ? "default" : "secondary"}
            >
              {result.source === "preloaded"
                ? "📦 Pre-loaded"
                : result.source === "cached"
                ? "⚡ Cached"
                : "🔥 Live AI"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {result.tweets.length} tweets for {result.brand_name}
            </span>
          </div>

          {/* Voice fingerprint */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Brand Voice Fingerprint
            </h2>
            <VoiceFingerprintPanel
              fingerprint={result.voice_fingerprint}
            />
          </div>

          <Separator />

          {/* Tweets */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Generated Tweets</h2>
            <TweetList tweets={result.tweets} />
          </div>
        </div>
      )}
    </div>
  );
}
