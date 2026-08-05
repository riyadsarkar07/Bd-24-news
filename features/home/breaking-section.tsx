"use client";

import Link from "next/link";
import { useArticles } from "@/hooks/useNews";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { timeAgo } from "@/lib/utils";
import { Zap } from "lucide-react";
import type { Article } from "@/types";

export function BreakingSpotlight({ initialData }: { initialData?: Article[] }) {
  const { data: breaking, isLoading } = useArticles({ breaking: true, limit: 5, initialData });
  const { lang } = useLanguage();

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-3xl" />;
  }

  if (!breaking || breaking.length === 0) return null;

  const lead = breaking[0]!;
  const rest = breaking.slice(1, 5);

  return (
    <section className="container-page py-8" aria-label="Breaking news spotlight">
      <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-6 text-white sm:p-8">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-[90px]" />
        <div className="relative grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-glow">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-white" />
                </span>
                <Zap className="h-3.5 w-3.5" />
                Breaking
              </span>
            </div>
            <Link href={`/article/${lead.slug}`} className="group mt-4 block">
              <h2 className="line-clamp-3 font-bengali text-2xl font-bold leading-tight transition-colors group-hover:text-brand-300 sm:text-3xl">
                {lang === "bn" ? lead.titleBn : lead.title}
              </h2>
              <p className="mt-3 line-clamp-2 text-sm text-white/60">{lead.excerpt}</p>
              <p className="mt-4 text-xs text-white/40">
                {lead.author} · {timeAgo(lead.publishedAt, lang)}
              </p>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1">
            {rest.map((a) => (
              <Link key={a.id} href={`/article/${a.slug}`} className="group flex items-center gap-3 rounded-xl bg-white/5 p-2.5 transition-all hover:bg-white/10">
                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                  <ImageWithFallback src={a.coverImage} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div>
                  <p className="line-clamp-2 text-xs font-semibold leading-snug transition-colors group-hover:text-brand-300">
                    {lang === "bn" ? a.titleBn : a.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/40">{timeAgo(a.publishedAt, lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
