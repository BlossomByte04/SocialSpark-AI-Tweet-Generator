/* API client for the FastAPI backend */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeout = 120000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      throw new APIError(body.detail || res.statusText, res.status);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

// ── Brands ───────────────────────────────────────────────────────────

import type {
  BrandListItem,
  GenerateRequest,
  GenerationResult,
  CompareResult,
  Generation,
  Stats,
  HealthCheck,
  VoiceFingerprint,
  Tweet,
} from "@/types/tweet-generator";

export async function getBrands(): Promise<BrandListItem[]> {
  return request<BrandListItem[]>("/api/brands");
}

export async function getBrand(name: string) {
  return request<{
    metadata: Record<string, string>;
    voice_fingerprint: VoiceFingerprint | null;
    tweets: Tweet[];
    source: string;
  }>(`/api/brands/${encodeURIComponent(name)}`);
}

export async function getBrandFingerprint(
  name: string
): Promise<VoiceFingerprint> {
  return request<VoiceFingerprint>(
    `/api/brands/${encodeURIComponent(name)}/fingerprint`
  );
}

export async function getBrandTweets(name: string): Promise<Tweet[]> {
  return request<Tweet[]>(
    `/api/brands/${encodeURIComponent(name)}/tweets`
  );
}

// ── Generate ─────────────────────────────────────────────────────────

export async function generateTweets(
  req: GenerateRequest
): Promise<GenerationResult> {
  return request<GenerationResult>("/api/generate", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function analyzeVoiceOnly(
  req: GenerateRequest
): Promise<VoiceFingerprint> {
  return request<VoiceFingerprint>("/api/generate/voice-only", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// ── Compare ──────────────────────────────────────────────────────────

export async function compareBrands(
  brandA: string,
  brandB: string
): Promise<CompareResult> {
  const params = new URLSearchParams({ brand_a: brandA, brand_b: brandB });
  return request<CompareResult>(`/api/compare?${params}`);
}

// ── History ──────────────────────────────────────────────────────────

export async function getHistory(
  brand?: string,
  limit = 50
): Promise<Generation[]> {
  const params = new URLSearchParams();
  if (brand) params.set("brand", brand);
  params.set("limit", String(limit));
  return request<Generation[]>(`/api/history?${params}`);
}

export async function getGeneration(id: string): Promise<Generation> {
  return request<Generation>(`/api/history/${id}`);
}

export async function exportCSV(
  id: string
): Promise<{ csv: string; filename: string }> {
  return request<{ csv: string; filename: string }>(
    `/api/history/${id}/export/csv`
  );
}

export async function exportText(
  id: string
): Promise<{ text: string; filename: string }> {
  return request<{ text: string; filename: string }>(
    `/api/history/${id}/export/text`
  );
}

// ── Health ────────────────────────────────────────────────────────────

export async function getHealth(): Promise<HealthCheck> {
  return request<HealthCheck>("/api/health");
}

export async function getStats(): Promise<Stats> {
  return request<Stats>("/api/stats");
}
