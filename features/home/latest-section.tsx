"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, PlayCircle, ListVideo, ArrowRight, Radio } from "lucide-react";
import { useArticles, useEditorPicks } from "@/hooks/useNews";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { timeAgo, toBanglaNumerals } from "@/lib/utils";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";

export function LatestSection({ initialData }: { initialData?: { latest?: Article[]; editorPicks?: Article[] } }) {
  const { data, isLoading, isError } = useArticles({ sort: "latest", limit: 8, initialData: initialData?.latest });
  const { data: editorPicks } = useEditorPicks(4, initialData?.editorPicks);
  const { lang } = useLanguage();
  const latest = data ?? [];
  const showSkeleton = isLoading && latest.length === 0 && !isError;

  return (
    <section className="container-page grid gap-8 py-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionHeading title="Latest News" titleBn="সর্বশেষ খবর" icon={<Zap className="h-4 w-4" />} link="/latest" />
        <div className="grid gap-5 sm:grid-cols-2">
          {showSkeleton
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border/60">
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </div>
              ))
            : latest?.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <ArticleCard article={a} variant="default" priority={i < 2} />
                </motion.div>
              ))}
        </div>
        <div className="mt-7 flex justify-center">
          <Link
            href="/latest"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-soft"
          >
            {lang === "bn" ? "আরও খবর দেখুন" : "Load more news"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <aside className="space-y-8">
        <section>
          <SectionHeading title="Editor's Pick" titleBn="সম্পাদকের পছন্দ" icon={<ListVideo className="h-4 w-4" />} color="#059669" />
          <div className="space-y-2">
            {editorPicks?.map((a) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                  <ImageWithFallback
                    src={a.coverImage}
                    alt={a.titleBn}
                    fill
                    sizes="80px"
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-brand">
                    {lang === "bn" ? a.titleBn : a.title}
                  </h4>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(a.publishedAt, lang)}</span>
                </div>
              </Link>
            ))}
            {!editorPicks &&
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-2">
                  <Skeleton className="h-16 w-20 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-navy-950 p-5 text-white shadow-card">
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/25 blur-3xl" />
          <div className="relative">
            <h3 className="flex items-center gap-2 font-bengali text-lg font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/20">
                <Radio className="h-4 w-4 text-brand" />
              </span>
              {lang === "bn" ? "লাইভ আপডেট" : "Live Update"}
            </h3>
            <div className="mt-4 space-y-2.5">
              {(latest ?? []).slice(0, 4).map((a, i) => (
                <Link
                  key={a.id}
                  href={`/article/${a.slug}`}
                  className="group flex items-start gap-3 rounded-lg p-1.5 transition-colors hover:bg-white/5"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand/20 text-[10px] font-black text-brand">
                    {toBanglaNumerals(i + 1)}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium text-white/75 transition-colors group-hover:text-brand-300">
                    {lang === "bn" ? a.titleBn : a.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </aside>
    </section>
  );
}
