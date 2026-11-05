"use client";

import Link from "next/link";
import type { Article } from "@/types";
import { useArticles } from "@/hooks/useNews";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategory } from "@/constants/categories";
import { useLanguage } from "@/providers/language-provider";
import { icons } from "@/components/shared/category-icons";
import { timeAgo } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function CategorySection({ slug, priority = false, initialData }: { slug: string; priority?: boolean; initialData?: Article[] }) {
  const { lang } = useLanguage();
  const { data, isLoading, isError } = useArticles({ category: slug, limit: 6, initialData });
  const articles = data ?? [];
  const cat = getCategory(slug);
  const Icon = icons[cat?.icon as keyof typeof icons] ?? icons.newspaper;
  const link = `/category/${slug}`;

  if (isLoading && articles.length === 0 && !isError) {
    return (
      <div>
        <Skeleton className="h-10 w-56" />
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  const lead = articles[0];
  const rest = articles.slice(1, 4);
  const moreLink = articles[4];

  return (
    <section className="group/section" aria-label={cat?.name}>
      <SectionHeading
        title={cat?.name ?? slug}
        titleBn={cat?.nameBn}
        link={link}
        color={cat?.color}
        icon={<Icon className="h-4 w-4" />}
      />
      <div className="grid gap-5 lg:grid-cols-12">
        {lead && (
          <div className="lg:col-span-5">
            <ArticleCard article={lead} priority={priority} className="h-full" />
          </div>
        )}
        <div className="grid gap-3 lg:col-span-4">
          {rest.map((a, i) => (
            <ArticleCard key={a.id} article={a} variant="horizontal" priority={priority && i === 0} />
          ))}
        </div>
        {moreLink && (
          <Link
            href={`/article/${moreLink.slug}`}
            className="group relative hidden overflow-hidden rounded-2xl bg-navy-950 lg:col-span-3 lg:block"
          >
            <ImageWithFallback
              src={moreLink.coverImage}
              alt={moreLink.titleBn}
              fill
              sizes="25vw"
              className="opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <span className="badge-cat" style={{ background: cat?.color }}>
                {lang === "bn" ? "ফিচার" : "Feature"}
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="line-clamp-3 font-bengali text-base font-bold leading-snug text-white">
                {lang === "bn" ? moreLink.titleBn : moreLink.title}
              </h3>
              <p className="mt-2 text-[11px] text-white/50">
                {moreLink.author} · {timeAgo(moreLink.publishedAt, lang)}
              </p>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
