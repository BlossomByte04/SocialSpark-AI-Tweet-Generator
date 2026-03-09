"use client";

import Image from "next/image";
import { BRAND_DISPLAY } from "@/types/tweet-generator";
import type { BrandListItem } from "@/types/tweet-generator";
import { useState } from "react";

interface BrandGridProps {
  brands: BrandListItem[];
  selected: string | null;
  onSelect: (brand: BrandListItem) => void;
}

function BrandLogo({ brandKey, emoji }: { brandKey: string; emoji: string }) {
  const display = BRAND_DISPLAY[brandKey];
  const [imgError, setImgError] = useState(false);

  if (!display?.logo || imgError) {
    return <span className="text-2xl">{display?.emoji || emoji}</span>;
  }

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-lg">
      <Image
        src={display.logo}
        alt={brandKey}
        fill
        className="object-contain"
        sizes="40px"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export function BrandGrid({ brands, selected, onSelect }: BrandGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {brands.map((b) => {
        const key = b.brand_name.toLowerCase().replace(/\s+/g, "_");
        const display = BRAND_DISPLAY[key];
        const active = selected === b.brand_name;

        return (
          <button
            key={b.brand_name}
            onClick={() => onSelect(b)}
            className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:scale-[1.03] ${
              active
                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            <BrandLogo brandKey={key} emoji={display?.emoji || "🏢"} />
            <span className="text-xs font-medium leading-tight">
              {b.brand_name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {display?.tagline || b.industry}
            </span>
            {b.source === "preloaded" && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
