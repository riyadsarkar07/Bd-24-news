"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal, Loader2 } from "lucide-react";
import { useArticles } from "@/hooks/useNews";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/constants/categories";
import { useLanguage } from "@/providers/language-provider";
import { toBanglaNumerals } from "@/lib/utils";

export function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const { lang } = useLanguage();
  const [query, setQuery] = React.useState(initialQuery);
  const [debounced, setDebounced] = React.useState(initialQuery);
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState<"latest" | "popular" | "oldest">("latest");
  const [visible, setVisible] = React.useState(12);

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(id);
  }, [query]);

  const { data: results, isLoading, isFetching } = useArticles({
    search: debounced,
    category: category === "all" ? undefined : category,
    sort,
    limit: 60,
  });

  React.useEffect(() => setVisible(12), [debounced, category, sort]);

  const list = results?.slice(0, visible) ?? [];

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "অনুসন্ধান" : "Search" }]} />

      <div className="mx-auto mt-6 max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDebounced(query);
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card focus-within:border-brand"
        >
          <SearchIcon className="ml-3 h-5 w-5 shrink-0 text-brand" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "bn" ? "খুঁজুন..." : "Search..."}
            className="border-none bg-transparent shadow-none focus-visible:ring-0"
          />
          {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />}
          <Button type="submit" className="shrink-0">
            {lang === "bn" ? "খুঁজুন" : "Search"}
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "bn" ? "সব বিভাগ" : "All categories"}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.nameBn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">{lang === "bn" ? "সর্বশেষ" : "Latest"}</SelectItem>
              <SelectItem value="popular">{lang === "bn" ? "জনপ্রিয়" : "Popular"}</SelectItem>
              <SelectItem value="oldest">{lang === "bn" ? "পুরাতন" : "Oldest"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {debounced && !isLoading
          ? lang === "bn"
            ? `"${debounced}" এর জন্য ${toBanglaNumerals(results?.length ?? 0)}টি ফলাফল`
            : `${results?.length ?? 0} results for "${debounced}"`
          : ""}
      </p>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a, i) => (
            <ArticleCard key={a.id} article={a} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <SearchIcon className="h-12 w-12" />
          <p className="font-bengali text-lg font-bold">
            {lang === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}
          </p>
          <p className="text-sm">{lang === "bn" ? "অন্য কিছু খুঁজে দেখুন" : "Try a different search term"}</p>
        </div>
      )}

      {(results?.length ?? 0) > visible && (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => setVisible((v) => v + 12)} className="px-8">
            {lang === "bn" ? "আরও লোড করুন" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
