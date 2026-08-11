"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Bookmark,
  BookmarkCheck,
  Printer,
  Volume2,
  VolumeX,
  Type,
  Heart,
  Clock,
  Eye,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import type { Article } from "@/types";
import { useRelatedArticles, useArticle } from "@/hooks/useNews";
import { useBookmarks, useReadingHistory } from "@/hooks/use-bookmarks";
import { useLanguage } from "@/providers/language-provider";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { ShareButtons } from "@/components/shared/share-buttons";
import { CommentSection } from "@/components/shared/comment-section";
import { ReadingProgress } from "@/components/shared/reading-progress";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime, formatNumber, toBanglaNumerals } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const FONT_SIZES = [
  { label: "A", scale: "text-base", size: 16 },
  { label: "A", scale: "text-lg", size: 18 },
  { label: "A", scale: "text-xl", size: 20 },
  { label: "A", scale: "text-2xl", size: 22 },
];

export function ArticlePage({ article: initialArticle }: { article: Article }) {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { data: article } = useArticle(initialArticle.slug, initialArticle);
  const { data: related } = useRelatedArticles(initialArticle.slug, []);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { addToHistory } = useReadingHistory();
  const [liked, setLiked] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(1);
  const [speaking, setSpeaking] = React.useState(false);
  const [fontMenu, setFontMenu] = React.useState(false);

  const url = `${siteConfig.url}${pathname}`;

  React.useEffect(() => {
    if (article) {
      addToHistory({ slug: article.slug, title: article.titleBn, category: article.category, image: article.coverImage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.slug]);

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error(lang === "bn" ? "ভয়েস সমর্থিত নয়" : "Voice not supported");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `${article?.titleBn ?? ""}. ${article?.body.replace(/[#*`>]/g, "") ?? ""}`,
    );
    utterance.lang = "bn-BD";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (!article) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  const nextPrev = related?.slice(0, 2);

  return (
    <div className="relative">
      <ReadingProgress />

      <div className="container-page py-6">
        <Breadcrumb
          items={[
            { label: article.category.charAt(0).toUpperCase() + article.category.slice(1), href: `/category/${article.category}` },
            { label: article.titleBn.slice(0, 28) + "…" },
          ]}
        />
      </div>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container-page max-w-4xl"
        itemScope
        itemType="https://schema.org/NewsArticle"
      >
        <header>
          <span className="badge-cat" style={{ background: article.categoryColor }} itemProp="articleSection">
            {article.category}
          </span>
          <h1
            className="mt-4 font-bengali text-3xl font-black leading-tight sm:text-4xl"
            itemProp="headline"
          >
            {lang === "bn" ? article.titleBn : article.title}
          </h1>
          <p className="mt-3 text-lg font-medium leading-relaxed text-muted-foreground" itemProp="description">
            {article.excerpt}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-y border-border/60 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/authors/${article.authorSlug}`} className="flex items-center gap-2">
                <Avatar className="h-10 w-10 border-2 border-brand/30">
                  <AvatarImage src={article.authorAvatar} alt={article.author} />
                  <AvatarFallback>{article.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span>
                  <span className="block text-sm font-bold transition-colors hover:text-brand" itemProp="author">
                    {article.author}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{article.authorRole}</span>
                </span>
              </Link>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <time dateTime={article.publishedAt} itemProp="datePublished">
                  {formatDateTime(article.publishedAt, { locale: lang })}
                </time>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {lang === "bn" ? `${toBanglaNumerals(article.readingMinutes)} মিনিট` : `${article.readingMinutes} min`}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(article.views, lang)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={() => setLiked((v) => !v)}
                aria-label="Like article"
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                {formatNumber(article.likes + (liked ? 1 : 0), lang)}
              </Button>
              <Button
                variant={isBookmarked(article.slug) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  toggleBookmark({
                    slug: article.slug,
                    title: article.titleBn,
                    category: article.category,
                    image: article.coverImage,
                    publishedAt: article.publishedAt,
                  });
                  toast.success(
                    isBookmarked(article.slug)
                      ? lang === "bn" ? "বুকমার্ক থেকে সরানো হয়েছে" : "Removed from bookmarks"
                      : lang === "bn" ? "বুকমার্কে যোগ হয়েছে" : "Added to bookmarks",
                  );
                }}
              >
                {isBookmarked(article.slug) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {lang === "bn" ? "বুকমার্ক" : "Bookmark"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} aria-label="Print">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleSpeech} aria-label="Read aloud">
                {speaking ? <VolumeX className="h-4 w-4 text-brand" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setFontMenu((v) => !v)} aria-label="Font size">
                  <Type className="h-4 w-4" />
                  A
                </Button>
                {fontMenu && (
                  <div className="absolute right-0 top-full z-30 mt-2 flex items-center gap-1 rounded-xl border bg-popover p-2 shadow-soft-lg">
                    {FONT_SIZES.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setFontSize(i)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg font-bold transition-all",
                          fontSize === i ? "bg-brand text-white" : "hover:bg-muted",
                        )}
                        style={{ fontSize: f.size }}
                        aria-label={`Font size ${f.size}`}
                      >
                        A
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="relative mt-6 overflow-hidden rounded-3xl">
          <ImageWithFallback
            src={article.coverImage}
            alt={article.titleBn}
            width={1200}
            height={675}
            priority
            className="aspect-[16/9] w-full object-cover"
            itemProp="image"
          />
          {article.location && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-brand-400" />
              {article.location}
            </span>
          )}
        </div>

        <div className="mt-8 flex gap-8">
          <div className="hidden w-12 shrink-0 flex-col items-center gap-2 pt-2 lg:flex">
            <ShareButtons title={article.titleBn} url={url} variant="sticky" />
          </div>

          <div className="min-w-0 flex-1">
            <div className={cn("prose-news font-bengali", FONT_SIZES[fontSize]?.scale)} itemProp="articleBody">
              {article.body.split("\n\n").map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.03 }}
                >
                  {para}
                </motion.p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground transition-all hover:border-brand hover:text-brand"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
              <Avatar className="h-16 w-16 border-2 border-brand/30">
                <AvatarImage src={article.authorAvatar} alt={article.author} />
                <AvatarFallback>{article.author.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-bold">{article.author}</p>
                <p className="text-xs text-muted-foreground">{article.authorRole}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {lang === "bn" ? `${article.author} বিডি২৪নিউজের প্রতিনিধি হিসেবে লিখছেন।` : `${article.author} writes for ${siteConfig.name}.`}
                </p>
              </div>
              <Link href={`/authors/${article.authorSlug}`}>
                <Button variant="outline" size="sm">
                  {lang === "bn" ? "সব লেখা" : "All articles"}
                </Button>
              </Link>
            </div>

            {nextPrev && nextPrev.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href={`/article/${nextPrev[0]?.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-card transition-all hover:border-brand/40"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0 text-brand" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === "bn" ? "আগের খবর" : "Previous"}
                    </span>
                    <span className="line-clamp-1 text-sm font-semibold group-hover:text-brand">
                      {lang === "bn" ? nextPrev[0]?.titleBn : nextPrev[0]?.title}
                    </span>
                  </span>
                </Link>
                {nextPrev[1] && (
                  <Link
                    href={`/article/${nextPrev[1].slug}`}
                    className="group flex items-center justify-end gap-3 rounded-2xl border border-border/60 bg-card p-4 text-right shadow-card transition-all hover:border-brand/40"
                  >
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {lang === "bn" ? "পরের খবর" : "Next"}
                      </span>
                      <span className="line-clamp-1 text-sm font-semibold group-hover:text-brand">
                        {lang === "bn" ? nextPrev[1].titleBn : nextPrev[1].title}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-brand" />
                  </Link>
                )}
              </div>
            )}

            <CommentSection articleId={article.id} />
          </div>
        </div>
      </motion.article>

      {related && related.length > 0 && (
        <section className="container-page mt-14">
          <SectionHeading title="Related News" titleBn="সম্পর্কিত খবর" link={`/category/${article.category}`} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="container-page mt-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-10">
          <ChevronLeft className="h-4 w-4" />
          {lang === "bn" ? "ফিরে যান" : "Go back"}
        </Button>
      </div>
    </div>
  );
}
