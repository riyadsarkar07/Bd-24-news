"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, X, Radio, Clapperboard, Images, Flame, Archive, UserRound, Settings } from "lucide-react";
import { categories } from "@/constants/categories";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    onClose();
    setExpanded(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: reduce ? 0 : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-background shadow-2xl lg:hidden"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b p-4">
              <Logo compact />
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <Link
                href="/"
                className={cn(
                  "mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold",
                  pathname === "/" ? "bg-brand text-white" : "hover:bg-muted",
                )}
              >
                {lang === "bn" ? "হোম" : "Home"}
              </Link>

              {categories.map((cat) => (
                <div key={cat.slug} className="mb-1">
                  <div className="flex items-center">
                    <Link
                      href={`/category/${cat.slug}`}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-2.5 text-sm font-bold",
                        pathname === `/category/${cat.slug}` ? "bg-brand text-white" : "hover:bg-muted",
                      )}
                    >
                      {lang === "bn" ? cat.nameBn : cat.name}
                    </Link>
                    <button
                      onClick={() => setExpanded(expanded === cat.slug ? null : cat.slug)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                      aria-label={`Toggle ${cat.name}`}
                    >
                      <ChevronRight className={cn("h-4 w-4 transition-transform", expanded === cat.slug && "rotate-90")} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {expanded === cat.slug && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-4 overflow-hidden"
                      >
                        {[
                          { label: lang === "bn" ? "সব খবর" : "All news", href: `/category/${cat.slug}` },
                          { label: lang === "bn" ? "সর্বশেষ" : "Latest", href: "/latest" },
                          { label: lang === "bn" ? "জনপ্রিয়" : "Popular", href: `/category/${cat.slug}?sort=popular` },
                        ].map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="block border-l border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-brand"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-4">
                {[
                  { label: "ভিডিও", href: "/videos", icon: Clapperboard },
                  { label: "ফটো", href: "/gallery", icon: Images },
                  { label: "লাইভ টিভি", href: "/live-tv", icon: Radio },
                  { label: "আর্কাইভ", href: "/archive", icon: Archive },
                  { label: "ব্রেকিং", href: "/breaking-news", icon: Flame },
                  { label: "মতামত", href: "/category/opinion", icon: UserRound },
                ].map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-bold transition-colors hover:border-brand hover:text-brand"
                  >
                    <s.icon className="h-4 w-4" />
                    {s.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 p-3">
                <Link href="/login" className="flex items-center gap-2 text-sm font-bold hover:text-brand">
                  <UserRound className="h-4 w-4" />
                  {lang === "bn" ? "লগইন" : "Login"}
                </Link>
                <span className="h-4 w-px bg-border" />
                <Link href="/admin" className="flex items-center gap-2 text-sm font-bold hover:text-brand">
                  <Settings className="h-4 w-4" />
                  {lang === "bn" ? "অ্যাডমিন" : "Admin"}
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
