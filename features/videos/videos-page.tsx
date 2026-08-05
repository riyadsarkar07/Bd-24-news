"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PlayCircle, X, Volume2 } from "lucide-react";
import { useArticles } from "@/hooks/useNews";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { timeAgo, toBanglaNumerals } from "@/lib/utils";

const SAMPLE_STREAMS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

export function VideosPage() {
  const { data: videos, isLoading } = useArticles({ category: "entertainment", limit: 12 });
  const { lang } = useLanguage();
  const [playing, setPlaying] = React.useState<number | null>(null);

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "ভিডিও" : "Videos" }]} />
      <div className="mt-4">
        <SectionHeading title="Videos" titleBn="ভিডিও" color="#DC2626" icon={<PlayCircle className="h-4 w-4" />} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos?.map((v, i) => (
            <motion.button
              key={v.id}
              onClick={() => setPlaying(i)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-video overflow-hidden rounded-2xl text-left shadow-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.coverImage}
                alt={v.titleBn}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  whileHover={{ scale: 1.15 }}
                  className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-glow"
                >
                  <span className="absolute inset-0 rounded-full bg-brand animate-pulse-ring" />
                  <PlayCircle className="h-7 w-7" />
                </motion.span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="mb-1 inline-block rounded bg-brand px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  HD
                </span>
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">
                  {lang === "bn" ? v.titleBn : v.title}
                </h3>
                <p className="mt-1 text-[11px] text-white/60">
                  {toBanglaNumerals((i + 1) * 2)}:30 · {timeAgo(v.publishedAt, lang)}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Dialog open={playing !== null} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-4xl border-none bg-black p-0">
          <DialogTitle className="sr-only">Video player</DialogTitle>
          {playing !== null && (
            <div className="aspect-video w-full">
              <video
                key={playing}
                src={SAMPLE_STREAMS[playing % SAMPLE_STREAMS.length]}
                controls
                autoPlay
                className="h-full w-full"
                poster={videos?.[playing]?.coverImage}
              />
            </div>
          )}
          <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
            <p className="line-clamp-1 text-sm font-semibold">
              {lang === "bn" ? videos?.[playing ?? 0]?.titleBn : videos?.[playing ?? 0]?.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Volume2 className="h-4 w-4" />
              {lang === "bn" ? "লাইভ" : "Live"}
              <Button size="icon-sm" variant="ghost" onClick={() => setPlaying(null)} className="text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
