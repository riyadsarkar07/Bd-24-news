"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { useArticles, useMostRead, useTrending } from "@/hooks/useNews";
import type { Article } from "@/types";
import { getCategory } from "@/constants/categories";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdSlot } from "@/components/shared/ad-slot";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { icons } from "@/components/shared/category-icons";
import { useLanguage } from "@/providers/language-provider";
import { timeAgo, cn, toBanglaNumerals } from "@/lib/utils";

const PAGE_SIZE = 12;

export function CategoryPage({ slug, initialData }: { slug: string; initialData?: Article[] }) {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const cat = getCategory(slug);
  const Icon = icons[cat?.icon as keyof typeof icons] ?? icons.newspaper;

  const [sort, setSort] = React.useState<"latest" | "popular" | "oldest">("latest");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const sortParam = searchParams.get("sort");
  React.useEffect(() => {
    if (sortParam === "popular") setSort("popular");
  }, [sortParam]);

  const { data: articles, isLoading } = useArticles({ category: slug, sort, initialData });
  const { data: mostRead } = useMostRead(6);
  const { data: trending } = useTrending(5);

  const pageArticles = articles?.slice(0, visible) ?? [];
  const hasMore = (articles?.length ?? 0) > visible;

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: cat?.nameBn ?? slug, href: `/category/${slug}` }]} />

      <div className="mt-4 flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <SectionHeading
            title={cat?.name ?? slug}
            titleBn={cat?.nameBn}
            color={cat?.color}
            icon={<Icon className="h-4 w-4" />}
          />
          <p className="-mt-2 mb-6 text-sm text-muted-foreground">{cat?.description}</p>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Tabs value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <TabsList>
                <TabsTrigger value="latest">{lang === "bn" ? "সর্বশেষ" : "Latest"}</TabsTrigger>
                <TabsTrigger value="popular">{lang === "bn" ? "জনপ্রিয়" : "Popular"}</TabsTrigger>
                <TabsTrigger value="oldest">{lang === "bn" ? "পুরাতন" : "Oldest"}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Select value={view} onValueChange={(v) => setView(v as typeof view)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">
                    <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> {lang === "bn" ? "গ্রিড" : "Grid"}</span>
                  </SelectItem>
                  <SelectItem value="list">
                    <span className="flex items-center gap-2"><List className="h-4 w-4" /> {lang === "bn" ? "তালিকা" : "List"}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className={view === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className={cn(view === "grid" ? "h-72 w-full" : "h-28 w-full")} />
              ))}
            </div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
              <AnimatePresence mode="popLayout">
                {pageArticles.map((a, i) => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <ArticleCard
                      article={a}
                      variant={view === "list" ? "horizontal" : "default"}
                      priority={i < 3}
                      className={view === "list" ? "!h-full !flex-col sm:!flex-row sm:!items-center" : ""}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="px-8">
                <Loader2 className="h-4 w-4" />
                {lang === "bn" ? "আরও লোড করুন" : "Load more"}
              </Button>
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 space-y-8 lg:w-80">
          <AdSlot size="sidebar" />
          <section>
            <SectionHeading title="Most Read" titleBn="সর্বাধিক পঠিত" color="#2563EB" />
            <div className="space-y-3">
              {mostRead?.slice(0, 5).map((a, i) => (
                <Link key={a.id} href={`/article/${a.slug}`} className="group flex gap-3 rounded-xl p-1.5 transition-all hover:bg-muted/50">
                  <span className="font-bengali text-2xl font-black leading-none text-muted/50 transition-colors group-hover:text-brand">
                    {lang === "bn" ? toBanglaNumerals(i + 1) : i + 1}
                  </span>
                  <span className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
                    {lang === "bn" ? a.titleBn : a.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
          <section>
            <SectionHeading title="Trending" titleBn="ট্রেন্ডিং" hot />
            <div className="space-y-1">
              {trending?.map((a) => (
                <Link key={a.id} href={`/article/${a.slug}`} className="group flex items-start gap-3 rounded-xl p-2 transition-all hover:bg-muted/50">
                  <span className="line-clamp-2 flex-1 text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
                    {lang === "bn" ? a.titleBn : a.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(a.publishedAt, lang)}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="glass-card rounded-2xl p-5">
            <p className="font-bengali text-sm font-bold">{lang === "bn" ? "নিউজলেটার" : "Newsletter"}</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {lang === "bn" ? "প্রতিদিনের খবর পান" : "Get the daily digest"}
            </p>
            <NewsletterForm />
          </section>
        </aside>
      </div>
    </div>
  );
}

function toBn(n: number): string {
  return toBanglaNumerals(n);
}
