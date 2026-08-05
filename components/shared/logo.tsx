import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label={`${siteConfig.name} — হোম`}>
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-700 shadow-glow transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
        <span className="font-bengali text-lg font-black text-white">বি২৪</span>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-sans text-xl font-black tracking-tight text-foreground">
            BD<span className="text-brand">24</span>
            <span className="font-bengali ml-1 align-middle text-sm font-bold">নিউজ</span>
          </span>
          <span className="mt-1 font-bengali text-[10px] font-medium tracking-wide text-muted-foreground">
            {siteConfig.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
