"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/providers/language-provider";
import { readerPageTitle } from "@/lib/reader-page-title";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  React.useEffect(() => {
    const title = readerPageTitle(pathname, lang);
    if (title) document.title = title;
  }, [pathname, lang]);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!reduce) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, reduce]);

  return (
    <motion.main
      key={pathname}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[60vh]"
    >
      {children}
    </motion.main>
  );
}
