"use client";

import { useLanguage } from "@/providers/language-provider";
import { useArticles } from "@/hooks/useNews";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";

export function NotFoundSuggestions() {
  const { lang } = useLanguage();
  const { data: suggestions, isLoading } = useArticles({ limit: 4 });

  return (
    <div className="mt-12 w-full max-w-3xl">
      <p className="mb-4 text-left text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {lang === "bn" ? "জনপ্রিয় খবর" : "Popular news"}
      </p>
      <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
        {isLoading
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          : suggestions?.map((a) => <ArticleCard key={a.id} article={a} variant="horizontal" />)}
      </div>
    </div>
  );
}
