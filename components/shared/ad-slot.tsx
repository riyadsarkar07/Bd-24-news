import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";

interface AdSlotProps {
  size?: "banner" | "sidebar" | "inline" | "leaderboard" | "native";
  className?: string;
}

export function AdSlot({ size = "banner", className }: AdSlotProps) {
  const heights: Record<string, string> = {
    banner: "h-[90px]",
    leaderboard: "h-[120px]",
    sidebar: "h-[250px]",
    inline: "h-[180px]",
    native: "h-[120px]",
  };

  return (
    <div
      className={`group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-gradient-to-br from-muted/40 to-muted/10 ${heights[size]} ${className ?? ""}`}
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <span className="absolute left-2 top-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
        Ad
      </span>
      <Link
        href="/advertise"
        className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground/70 transition-all group-hover:bg-background/60 group-hover:text-brand"
      >
        <span className="hidden sm:inline">Your ad here</span>
        <span className="sm:hidden">Ad</span>
        <span className="text-muted-foreground/40">·</span>
        {siteConfig.name} Ad Space
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
