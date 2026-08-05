"use client";

import * as React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, PlayCircle, Images } from "lucide-react";
import type { Article } from "@/types";
import { formatNumber, timeAgo } from "@/lib/utils";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function HeroSlider({ articles }: { articles: Article[] }) {
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const swiperRef = React.useRef<SwiperType | null>(null);
  const main = articles.slice(0, 5);

  return (
    <section className="container-page grid gap-6 py-6 lg:grid-cols-3" aria-label="Top stories">
      <div className="relative overflow-hidden rounded-3xl shadow-soft-lg lg:col-span-2">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          speed={800}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={main.length > 1}
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          className="hero-swiper h-full"
        >
          {main.map((a) => (
            <SwiperSlide key={a.id}>
              <Link href={`/article/${a.slug}`} className="group relative block h-[420px] w-full md:h-[520px]">
                <ImageWithFallback
                  src={a.coverImage}
                  alt={a.titleBn}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="transition-transform duration-[1500ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                {a.isVideo && (
                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow-glow">
                    <PlayCircle className="h-4 w-4" /> Video
                  </span>
                )}
                {a.isGallery && (
                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-accentblue px-3 py-1 text-xs font-bold text-white">
                    <Images className="h-4 w-4" /> Gallery
                  </span>
                )}
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute inset-x-0 bottom-0 p-5 sm:p-8"
                >
                  <div className="flex items-center gap-2">
                    <span className="badge-cat" style={{ background: a.categoryColor }}>
                      {a.category}
                    </span>
                    {a.breaking && (
                      <span className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                          <span className="relative h-2 w-2 rounded-full bg-brand" />
                        </span>
                        Breaking
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 line-clamp-3 font-bengali text-2xl font-bold leading-tight text-white transition-colors group-hover:text-brand-100 sm:text-3xl lg:text-4xl">
                    {lang === "bn" ? a.titleBn : a.title}
                  </h2>
                  <p className="mt-3 hidden max-w-2xl line-clamp-2 text-sm text-white/70 sm:block">{a.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                        {a.author.slice(0, 2)}
                      </span>
                      {a.author}
                    </span>
                    <span>{timeAgo(a.publishedAt, lang)}</span>
                    <span>{lang === "bn" ? `${formatNumber(a.views, lang)} বার পঠিত` : `${formatNumber(a.views)} views`}</span>
                  </div>
                </motion.div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-all hover:bg-brand hover:shadow-glow"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-all hover:bg-brand hover:shadow-glow"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 right-5 z-20 flex items-center gap-2">
          {main.map((a, i) => (
            <button
              key={a.id}
              onClick={() => swiperRef.current?.slideTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                activeIndex === i ? "w-8 bg-brand" : "w-2 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        {articles.slice(5, 9).map((a, i) => (
          <Link
            key={a.id}
            href={`/article/${a.slug}`}
            className="group relative overflow-hidden rounded-2xl shadow-card"
          >
            <div className="relative h-36 w-full sm:h-44 lg:h-[112px] xl:h-[128px]">
              <ImageWithFallback
                src={a.coverImage}
                alt={a.titleBn}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <span className="absolute left-2 top-2 badge-cat !text-[9px]" style={{ background: a.categoryColor }}>
                {a.category}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="line-clamp-2 text-xs font-bold leading-snug text-white transition-colors group-hover:text-brand-100 sm:text-sm">
                {lang === "bn" ? a.titleBn : a.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
