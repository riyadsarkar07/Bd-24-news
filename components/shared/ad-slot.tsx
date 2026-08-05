import Link from "next/link";
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
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 ${heights[size]} ${className ?? ""}`}
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="absolute left-2 top-1.5 rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
        Ad
      </div>
      <Link
        href="/advertise"
        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/70 transition-colors hover:text-brand"
      >
        <span className="hidden sm:inline">Your ad here</span>
        <span className="sm:hidden">Ad</span>
        <span className="text-muted-foreground/40">·</span>
        {siteConfig.name} Ad Space
      </Link>
    </div>
  );
}
