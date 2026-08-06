"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/providers/language-provider";
import { useArticles } from "@/hooks/useNews";
import { breakingNewsItems } from "@/constants/widgets";

export function NewsTicker() {
  const { t, lang } = useLanguage();
  const { data: breaking } = useArticles({ breaking: true, limit: 10, sort: "latest" });
  const fallback = breakingNewsItems;
  const items =
    breaking && breaking.length > 0
      ? breaking.map((a) => (lang === "bn" ? a.titleBn : a.title)).filter(Boolean)
      : fallback;
  const doubled = [...items, ...items];

  if (doubled.length === 0) return null;

  return (
    <div
      className="relative flex h-10 items-center overflow-hidden border-y border-border/60 bg-navy-950 text-white"
      role="region"
      aria-label={t("breaking")}
    >
      <div className="relative z-10 flex h-full shrink-0 items-center gap-1.5 bg-brand px-4 shadow-glow">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        <span className="font-bengali text-xs font-bold uppercase tracking-wider">{t("breaking")}</span>
      </div>
      <div className="mask-fade-x relative flex-1 overflow-hidden">
        <motion.div
          className="flex w-max items-center gap-12 whitespace-nowrap py-2"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ x: { duration: 45, ease: "linear", repeat: Infinity } }}
        >
          {doubled.map((item, i) => {
            const target = breaking && breaking.length > 0 ? breaking[i % breaking.length] : undefined;
            const wrap = target ? (
              <Link key={`${item}-${i}`} href={`/article/${target.slug}`} className="flex items-center gap-3 text-xs font-medium text-white/90 transition-colors hover:text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {item}
              </Link>
            ) : (
              <span key={`${item}-${i}`} className="flex items-center gap-3 text-xs font-medium text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                {item}
              </span>
            );
            return wrap;
          })}
        </motion.div>
      </div>
    </div>
  );
}
