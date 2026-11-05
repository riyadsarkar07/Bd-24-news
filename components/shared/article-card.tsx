import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye, PlayCircle, Images, Flame } from "lucide-react";
import type { Article } from "@/types";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { useLanguage } from "@/providers/language-provider";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "overlay" | "horizontal" | "compact" | "video";
  priority?: boolean;
  className?: string;
}

export function ArticleCard({ article, variant = "default", priority, className }: ArticleCardProps) {
  const { lang } = useLanguage();
  const title = lang === "bn" ? article.titleBn : article.title;

  if (variant === "compact") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn("group flex items-start gap-3 rounded-xl p-2 transition-all hover:bg-muted/50", className)}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-700 text-sm font-black text-white shadow-glow">
          {String(article.id).slice(-2)}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-brand">
            {title}
          </h4>
          <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(article.publishedAt, lang)}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn(
          "group flex gap-4 rounded-2xl border border-transparent p-2 transition-all hover:border-border/60 hover:bg-muted/40",
          className,
        )}
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
          <ImageWithFallback
            src={article.coverImage}
            alt={article.titleBn}
            fill
            sizes="(max-width: 640px) 112px, 112px"
            className="transition-transform duration-500 group-hover:scale-110"
          />
          {article.isVideo && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <PlayCircle className="h-6 w-6 text-white/90" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="badge-cat mb-1.5 !px-2 !py-0.5 !text-[10px]"
            style={{ background: article.categoryColor }}
          >
            {article.category}
          </span>
          <h4 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-brand">
            {title}
          </h4>
          <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(article.publishedAt, lang)}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "overlay") {
    return (
      <Link href={`/article/${article.slug}`} className={cn("group relative block h-full w-full overflow-hidden rounded-2xl", className)}>
        <ImageWithFallback
          src={article.coverImage}
          alt={article.titleBn}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="badge-cat mb-2" style={{ background: article.categoryColor }}>
            {article.category}
          </span>
          <h3 className="line-clamp-3 text-xl font-bold leading-snug text-white transition-colors group-hover:text-brand-100">
            {title}
          </h3>
          <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
            <span>{article.author}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(article.publishedAt, lang)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(article.views, lang)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "video") {
    return (
      <Link href={`/article/${article.slug}`} className={cn("group relative block aspect-video overflow-hidden rounded-2xl shadow-card", className)}>
        <ImageWithFallback
          src={article.coverImage}
          alt={article.titleBn}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            whileHover={{ scale: 1.15 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand/90 text-white shadow-glow backdrop-blur"
          >
            <span className="absolute inset-0 rounded-full bg-brand animate-pulse-ring" />
            <PlayCircle className="h-7 w-7" />
          </motion.span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">
            {title}
          </h3>
          <span className="mt-1 text-[11px] text-white/70">{article.readingMinutes} min</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-soft-lg",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <ImageWithFallback
          src={article.coverImage}
          alt={article.titleBn}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 badge-cat" style={{ background: article.categoryColor }}>
          {article.category}
        </span>
        {article.breaking ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand shadow backdrop-blur">
            <Flame className="h-3 w-3" />
            Breaking
          </span>
        ) : article.isGallery ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
            <Images className="h-3 w-3" />
            {lang === "bn" ? "গ্যালারি" : "Gallery"}
          </span>
        ) : article.isVideo ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
            <PlayCircle className="h-3 w-3" />
            Video
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug transition-colors group-hover:text-brand">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground/70">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[9px] font-bold text-brand">
              {article.author.slice(0, 1)}
            </span>
            <span className="truncate">{article.author}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(article.publishedAt, lang)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(article.views, lang)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
