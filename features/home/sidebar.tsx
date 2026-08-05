"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Eye, Users, Mail } from "lucide-react";
import { useMostRead, useTrending } from "@/hooks/useNews";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { AdSlot } from "@/components/shared/ad-slot";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { timeAgo, toBanglaNumerals } from "@/lib/utils";

export function Sidebar({ initialData }: { initialData?: { trending?: Article[]; mostRead?: Article[] } }) {
  const { data: trending } = useTrending(5, initialData?.trending);
  const { data: mostRead } = useMostRead(6, initialData?.mostRead);
  const { t, lang } = useLanguage();

  return (
    <aside className="space-y-8" aria-label="Sidebar">
      <section>
        <SectionHeading title="Trending" titleBn="ট্রেন্ডিং" icon={<Flame className="h-4 w-4" />} hot />
        <div className="space-y-1">
          {trending?.map((a, i) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="group flex items-start gap-3 rounded-xl p-2 transition-all hover:bg-muted/50"
            >
              <span
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bengali text-sm font-black"
                style={{ background: i < 3 ? "#E50914" : "#0F172A", color: "#fff" }}
              >
                {lang === "bn" ? toBanglaNumerals(i + 1) : i + 1}
              </span>
              <span>
                <span className="block line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
                  {lang === "bn" ? a.titleBn : a.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{timeAgo(a.publishedAt, lang)}</span>
              </span>
            </Link>
          ))}
          {!trending && [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      </section>

      <AdSlot size="sidebar" />

      <section>
        <SectionHeading title="Most Read" titleBn="সর্বাধিক পঠিত" icon={<Eye className="h-4 w-4" />} color="#2563EB" />
        <div className="space-y-3">
          {mostRead?.slice(0, 4).map((a, i) => (
            <Link key={a.id} href={`/article/${a.slug}`} className="group flex gap-3 rounded-xl p-1.5 transition-all hover:bg-muted/50">
              <span className="font-bengali text-3xl font-black leading-none text-muted/60 transition-colors group-hover:text-brand">
                {lang === "bn" ? toBanglaNumerals(i + 1) : i + 1}
              </span>
              <span className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
                {lang === "bn" ? a.titleBn : a.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-card overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-600 to-accentblue p-6 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bengali text-lg font-bold">{t("newsletter")}</h3>
            <p className="text-xs text-white/70">{t("newsletterDesc")}</p>
          </div>
        </div>
        <div className="mt-4">
          <NewsletterForm variant="footer" />
        </div>
      </section>

      <section>
        <SectionHeading title="Social Media" titleBn="সোশ্যাল মিডিয়া" icon={<Users className="h-4 w-4" />} color="#7C3AED" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: lang === "bn" ? "ফেসবুক" : "Facebook", count: "2.4M", color: "#1877F2" },
            { label: lang === "bn" ? "ইউটিউব" : "YouTube", count: "1.8M", color: "#FF0000" },
            { label: lang === "bn" ? "ইনস্টাগ্রাম" : "Instagram", count: "890K", color: "#E4405F" },
            { label: lang === "bn" ? "টিকটক" : "TikTok", count: "3.1M", color: "#000000" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card p-3 text-center shadow-card">
              <span className="font-bengali text-xl font-black" style={{ color: s.color }}>{s.count}</span>
              <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot size="sidebar" />
    </aside>
  );
}

function toBn(n: number): string {
  return toBanglaNumerals(n);
}
