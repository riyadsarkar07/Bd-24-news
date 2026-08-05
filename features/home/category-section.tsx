"use client";

import Link from "next/link";
import type { Article } from "@/types";
import { useArticles } from "@/hooks/useNews";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategory } from "@/constants/categories";
import { useLanguage } from "@/providers/language-provider";
import { icons } from "@/components/shared/category-icons";
import { cn } from "@/lib/utils";

export function CategorySection({ slug, priority = false, initialData }: { slug: string; priority?: boolean; initialData?: Article[] }) {
  const { lang } = useLanguage();
  const { data: articles, isLoading } = useArticles({ category: slug, limit: 6, initialData });
  const cat = getCategory(slug);
  const Icon = icons[cat?.icon as keyof typeof icons] ?? icons.newspaper;
  const link = `/category/${slug}`;

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-56" />
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <section className="group/section" aria-label={cat?.name}>
      <SectionHeading
        title={cat?.name ?? slug}
        titleBn={cat?.nameBn}
        link={link}
        color={cat?.color}
        icon={<Icon className="h-4 w-4" />}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {articles.slice(0, 4).map((a, i) => (
          <ArticleCard key={a.id} article={a} priority={priority && i === 0} />
        ))}
      </div>
      <div className={cn("mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4")}>
        {articles.slice(4, 6).map((a) => (
          <ArticleCard key={a.id} article={a} variant="horizontal" className="lg:col-span-2" />
        ))}
      </div>
    </section>
  );
}
