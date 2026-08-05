"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/providers/language-provider";
import { breakingNewsItems } from "@/constants/widgets";

export function NewsTicker() {
  const { t } = useLanguage();
  const items = [...breakingNewsItems, ...breakingNewsItems];

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
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-xs font-medium text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
