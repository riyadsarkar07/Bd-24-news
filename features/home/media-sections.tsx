"use client";

import Link from "next/link";
import type { Article } from "@/types";
import { useArticles } from "@/hooks/useNews";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { Images, PlayCircle, Camera } from "lucide-react";

export function VideoSection({ initialData }: { initialData?: Article[] }) {
  const { data: videoData, isLoading, isError } = useArticles({ category: "entertainment", limit: 4, initialData });
  const videos = videoData ?? [];
  const showSkeleton = isLoading && videos.length === 0 && !isError;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-muted/40 to-transparent py-12 dark:via-navy-950/50">
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="container-page">
        <SectionHeading
          title="Videos"
          titleBn="ভিডিও"
          icon={<PlayCircle className="h-4 w-4" />}
          link="/videos"
          color="#DC2626"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {showSkeleton
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-video w-full rounded-2xl" />)
            : videos?.map((a) => <ArticleCard key={a.id} article={a} variant="video" />)}
        </div>
      </div>
    </section>
  );
}

export function GallerySection({ initialData }: { initialData?: Article[] }) {
  const { data: galleryData, isLoading, isError } = useArticles({ category: "travel", limit: 5, initialData });
  const { lang } = useLanguage();
  const galleries = galleryData ?? [];
  const showSkeleton = isLoading && galleries.length === 0 && !isError;

  return (
    <section className="container-page py-12">
      <SectionHeading
        title="Photo Gallery"
        titleBn="ফটো গ্যালারি"
        icon={<Images className="h-4 w-4" />}
        link="/gallery"
        color="#2563EB"
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[150px]">
        {showSkeleton
          ? [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)
          : galleries?.map((a, i) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                className={`group relative overflow-hidden rounded-2xl shadow-card ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <div className={`relative h-full ${i === 0 ? "min-h-[300px] md:min-h-full" : "min-h-[150px]"}`}>
                  <ImageWithFallback
                    src={a.coverImage}
                    alt={a.titleBn}
                    fill
                    sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "25vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-brand/0 transition-colors duration-300 group-hover:bg-brand/10" />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                    <Camera className="h-3 w-3" />
                    {lang === "bn" ? "গ্যালারি" : "Gallery"}
                  </span>
                  <p className={`absolute inset-x-0 bottom-0 line-clamp-2 p-3 font-bengali font-bold text-white ${i === 0 ? "text-lg" : "text-xs"}`}>
                    {lang === "bn" ? a.titleBn : a.title}
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
