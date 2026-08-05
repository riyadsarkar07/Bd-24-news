"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useArticles, useMostRead, useTrending } from "@/hooks/useNews";
import type { Article } from "@/types";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/shared/ad-slot";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { useLanguage } from "@/providers/language-provider";
import { toBanglaNumerals } from "@/lib/utils";

interface NewsListingProps {
  title: string;
  titleBn: string;
  icon?: React.ReactNode;
  color?: string;
  breadcrumb: string;
  filters?: {
    label: string;
    value: string;
    opts: Parameters<typeof useArticles>[0];
  }[];
  initialData?: Article[];
  pageSize?: number;
}

export function NewsListing({
  title,
  titleBn,
  icon,
  color,
  breadcrumb,
  filters = [],
  initialData,
  pageSize = 12,
}: NewsListingProps) {
  const { lang } = useLanguage();
  const [activeFilter, setActiveFilter] = React.useState<string>(filters[0]?.value ?? "all");
  const [visible, setVisible] = React.useState(pageSize);

  const active = filters.find((f) => f.value === activeFilter);
  const queryOpts = active?.opts ?? {};
  const { data: articles, isLoading } = useArticles({ ...queryOpts, initialData });
  const { data: mostRead } = useMostRead(6);
  const { data: trending } = useTrending(5);

  React.useEffect(() => setVisible(pageSize), [activeFilter, pageSize]);

  const list = articles?.slice(0, visible) ?? [];
  const hasMore = (articles?.length ?? 0) > visible;

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: breadcrumb }]} />
      <div className="mt-4 flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <SectionHeading title={title} titleBn={titleBn} icon={icon} color={color} />
          {filters.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={
                    activeFilter === f.value
                      ? "rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-glow"
                      : "rounded-full border border-border px-4 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:border-brand hover:text-brand"
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-72 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <ArticleCard article={a} priority={i < 3} />
                </motion.div>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button onClick={() => setVisible((v) => v + pageSize)} className="px-8">
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
                <a key={a.id} href={`/article/${a.slug}`} className="group flex gap-3 rounded-xl p-1.5 transition-all hover:bg-muted/50">
                  <span className="font-bengali text-2xl font-black leading-none text-muted/50 transition-colors group-hover:text-brand">
                    {lang === "bn" ? toBanglaNumerals(i + 1) : i + 1}
                  </span>
                  <span className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
                    {lang === "bn" ? a.titleBn : a.title}
                  </span>
                </a>
              ))}
            </div>
          </section>
          <section className="glass-card rounded-2xl p-5">
            <p className="font-bengali text-sm font-bold">{lang === "bn" ? "নিউজলেটার" : "Newsletter"}</p>
            <p className="mb-3 text-xs text-muted-foreground">{lang === "bn" ? "প্রতিদিনের খবর পান" : "Get the daily digest"}</p>
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
