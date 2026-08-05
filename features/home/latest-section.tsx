"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, PlayCircle, ListVideo } from "lucide-react";
import { useArticles, useEditorPicks } from "@/hooks/useNews";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { timeAgo, toBanglaNumerals } from "@/lib/utils";

export function LatestSection({ initialData }: { initialData?: { latest?: Article[]; editorPicks?: Article[] } }) {
  const { data: latest, isLoading } = useArticles({ sort: "latest", limit: 8, initialData: initialData?.latest });
  const { data: editorPicks } = useEditorPicks(4, initialData?.editorPicks);
  const { lang } = useLanguage();

  return (
    <section className="container-page grid gap-8 py-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionHeading title="Latest News" titleBn="সর্বশেষ খবর" icon={<Zap className="h-4 w-4" />} link="/latest" />
        <div className="grid gap-5 sm:grid-cols-2">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full" />)
            : latest?.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <ArticleCard article={a} variant="default" priority={i < 2} />
                </motion.div>
              ))}
        </div>
        <Link href="/latest" className="mt-6 flex items-center justify-center">
          <span className="btn-outline px-8 py-3 text-sm font-bold">
            {lang === "bn" ? "আরও খবর দেখুন" : "Load more news"}
          </span>
        </Link>
      </div>

      <aside className="space-y-8">
        <section>
          <SectionHeading title="Editor's Pick" titleBn="সম্পাদকের পছন্দ" icon={<ListVideo className="h-4 w-4" />} color="#059669" />
          <div className="space-y-4">
            {editorPicks?.map((a) => (
              <Link key={a.id} href={`/article/${a.slug}`} className="group flex gap-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.coverImage} alt={a.titleBn} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-brand">
                    {lang === "bn" ? a.titleBn : a.title}
                  </h4>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(a.publishedAt, lang)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-navy-950 p-5 text-white">
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="relative">
            <h3 className="flex items-center gap-2 font-bengali text-lg font-bold">
              <PlayCircle className="h-5 w-5 text-brand" />
              {lang === "bn" ? "লাইভ আপডেট" : "Live Update"}
            </h3>
            <div className="mt-4 space-y-2.5">
              {(latest ?? []).slice(0, 4).map((a, i) => (
                <Link key={a.id} href={`/article/${a.slug}`} className="group flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand/20 text-[10px] font-black text-brand">
                    {toBanglaNumerals(i + 1)}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium text-white/80 transition-colors group-hover:text-brand-300">
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
