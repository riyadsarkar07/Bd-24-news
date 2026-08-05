"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Home, Radio, Clapperboard, Images, Archive, Flame } from "lucide-react";
import { categories } from "@/constants/categories";
import { useArticles } from "@/hooks/useNews";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

const sectionLinks = [
  { label: "ভিডিও", href: "/videos", icon: Clapperboard },
  { label: "ফটো", href: "/gallery", icon: Images },
  { label: "লাইভ", href: "/live-tv", icon: Radio },
  { label: "ব্রেকিং", href: "/breaking-news", icon: Flame },
  { label: "আর্কাইভ", href: "/archive", icon: Archive },
];

export function MegaNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [open, setOpen] = React.useState<string | null>(null);
  const reduce = useReducedMotion();
  const { data: heroArticles } = useArticles({ featured: true, limit: 6 });

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="glass-nav sticky top-0 z-40 border-b"
      aria-label="Primary"
      onMouseLeave={() => setOpen(null)}
    >
      <div className="container-page flex h-12 items-center">
        <div className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto">
          <Link
            href="/"
            onMouseEnter={() => setOpen(null)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all",
              isActive("/")
                ? "bg-brand text-white shadow-glow"
                : "text-foreground/80 hover:bg-muted hover:text-brand",
            )}
          >
            <Home className="h-4 w-4" />
            {lang === "bn" ? "হোম" : "Home"}
          </Link>

          {categories.map((cat) => (
            <div key={cat.slug} className="relative shrink-0" onMouseEnter={() => setOpen(cat.slug)}>
              <Link
                href={`/category/${cat.slug}`}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-bold transition-all",
                  isActive(`/category/${cat.slug}`)
                    ? "bg-brand text-white shadow-glow"
                    : "text-foreground/80 hover:bg-muted hover:text-brand",
                )}
              >
                {lang === "bn" ? cat.nameBn : cat.name}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", open === cat.slug && "rotate-180")} />
              </Link>

              <AnimatePresence>
                {open === cat.slug && (
                  <motion.div
                    initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduce ? 0 : 8 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-0 top-full z-50 border-t border-border/50 bg-background/95 shadow-soft-lg backdrop-blur-2xl"
                  >
                    <div className="container-page grid grid-cols-12 gap-8 py-6">
                      <div className="col-span-3">
                        <p className="font-bengali text-lg font-bold" style={{ color: cat.color }}>
                          {cat.nameBn}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                        <Link
                          href={`/category/${cat.slug}`}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                        >
                          {lang === "bn" ? "সব খবর দেখুন" : "View all news"} →
                        </Link>
                      </div>
                      <div className="col-span-6 grid grid-cols-3 gap-4">
                        {(heroArticles ?? []).slice(0, 3).map((a) => (
                          <Link key={a.id} href={`/article/${a.slug}`} className="group block" onClick={() => setOpen(null)}>
                            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                              <ImageWithFallback
                                src={a.coverImage}
                                alt={a.titleBn}
                                fill
                                sizes="(max-width: 768px) 33vw, 200px"
                                className="transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug transition-colors group-hover:text-brand">
                              {lang === "bn" ? a.titleBn : a.title}
                            </p>
                          </Link>
                        ))}
                      </div>
                      <div className="col-span-3 grid content-start gap-1">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {lang === "bn" ? "জনপ্রিয়" : "Popular"}
                        </p>
                        {(heroArticles ?? []).slice(0, 5).map((a, i) => (
                          <Link
                            key={a.id}
                            href={`/article/${a.slug}`}
                            onClick={() => setOpen(null)}
                            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted/60"
                          >
                            <span className="text-sm font-black" style={{ color: cat.color }}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="line-clamp-1 text-xs font-medium">{lang === "bn" ? a.titleBn : a.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {sectionLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setOpen(null)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all",
                item.href === "/live-tv" && "text-brand",
                isActive(item.href)
                  ? "bg-brand text-white shadow-glow"
                  : "text-foreground/80 hover:bg-muted hover:text-brand",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
