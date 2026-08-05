"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Images, ChevronLeft, ChevronRight, X, Download, Heart } from "lucide-react";
import { useArticles } from "@/hooks/useNews";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { toBanglaNumerals } from "@/lib/utils";

export function GalleryPage() {
  const { data: galleries, isLoading } = useArticles({ limit: 15 });
  const { lang } = useLanguage();
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  const items = galleries ?? [];
  const active = lightbox !== null ? items[lightbox] : null;

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "ফটো গ্যালারি" : "Photo Gallery" }]} />
      <div className="mt-4">
        <SectionHeading title="Photo Gallery" titleBn="ফটো গ্যালারি" color="#2563EB" icon={<Images className="h-4 w-4" />} />
      </div>

      {isLoading ? (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="mb-4 h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
          {items.map((g, i) => (
            <motion.button
              key={g.id}
              onClick={() => setLightbox(i)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.05 }}
              className="group relative block w-full overflow-hidden rounded-2xl text-left shadow-card"
            >
              <div className={i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.coverImage}
                  alt={g.titleBn}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <p className="line-clamp-2 text-xs font-bold text-white">{lang === "bn" ? g.titleBn : g.title}</p>
                <p className="mt-1 flex items-center gap-2 text-[10px] text-white/70">
                  <Images className="h-3 w-3" />
                  {toBanglaNumerals(6 + (i % 12))} {lang === "bn" ? "ছবি" : "photos"}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox !== null && active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-brand"
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-brand"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox + items.length - 1) % items.length);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-brand"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox + 1) % items.length);
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="max-h-full max-w-5xl px-4" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.coverImage} alt={active.titleBn} className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl" />
              <div className="mt-4 flex items-center justify-between gap-4 text-white">
                <div>
                  <p className="font-bengali text-lg font-bold">{lang === "bn" ? active.titleBn : active.title}</p>
                  <p className="text-xs text-white/60">
                    {toBanglaNumerals(lightbox + 1)} / {toBanglaNumerals(items.length)} · {active.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-brand" aria-label="Like">
                    <Heart className="h-4 w-4" />
                  </button>
                  <a
                    href={active.coverImage}
                    download
                    className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-brand"
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
