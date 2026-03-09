"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Twitter,
  Sparkles,
  GitCompareArrows,
  Clock,
  Info,
  Database,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api-client";

const navItems = [
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/history", label: "History", icon: Clock },
  { href: "/about", label: "How It Works", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mongoConnected, setMongoConnected] = useState(false);

  useEffect(() => {
    getHealth()
      .then((h) => setMongoConnected(h.mongo))
      .catch(() => setMongoConnected(false));
  }, []);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Twitter className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight">
            SocialSpark AI
          </h1>
          <p className="text-xs text-sidebar-foreground/60">Walnut Folks</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
          <Database className="h-3.5 w-3.5" />
          <span>MongoDB</span>
          <Badge
            variant={mongoConnected ? "default" : "secondary"}
            className="ml-auto h-5 px-1.5 text-[10px]"
          >
            {mongoConnected ? "Connected" : "Offline"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
          <Zap className="h-3.5 w-3.5" />
          <span>Gemini 2.5 Flash</span>
        </div>
      </div>
    </aside>
  );
}
