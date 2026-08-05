"use client";

import Link from "next/link";
import type { Article } from "@/types";
import { useArticles } from "@/hooks/useNews";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { Images, PlayCircle } from "lucide-react";

export function VideoSection({ initialData }: { initialData?: Article[] }) {
  const { data: videos, isLoading } = useArticles({ category: "entertainment", limit: 4, initialData });
  const { lang } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-navy-50/60 to-transparent py-10 dark:via-navy-950/40">
      <div className="container-page">
        <SectionHeading
          title="Videos"
          titleBn="ভিডিও"
          icon={<PlayCircle className="h-4 w-4" />}
          link="/videos"
          color="#DC2626"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-video w-full rounded-2xl" />)
            : videos?.map((a) => <ArticleCard key={a.id} article={a} variant="video" />)}
        </div>
      </div>
    </section>
  );
}

export function GallerySection({ initialData }: { initialData?: Article[] }) {
  const { data: galleries, isLoading } = useArticles({ category: "travel", limit: 5, initialData });
  const { lang } = useLanguage();

  return (
    <section className="container-page py-10">
      <SectionHeading
        title="Photo Gallery"
        titleBn="ফটো গ্যালারি"
        icon={<Images className="h-4 w-4" />}
        link="/gallery"
        color="#2563EB"
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {isLoading
          ? [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)
          : galleries?.map((a, i) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <div className={`relative ${i === 0 ? "h-full min-h-[360px]" : "h-44"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.coverImage}
                    alt={a.titleBn}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                    <Images className="h-3 w-3" />
                    {lang === "bn" ? "গ্যালারি" : "Gallery"}
                  </span>
                  <p className={`absolute bottom-0 line-clamp-2 p-3 font-bengali font-bold text-white ${i === 0 ? "text-lg" : "text-xs"}`}>
                    {lang === "bn" ? a.titleBn : a.title}
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
