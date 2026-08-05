"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, TrendingUp, History, ArrowRight, Mic, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useNews";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLanguage } from "@/providers/language-provider";
import { ImageWithFallback } from "@/components/shared/image-with-fallback";
import { getCategory } from "@/constants/categories";
import { trendingSearches } from "@/constants/search";
import { cn } from "@/lib/utils";

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SearchContext = React.createContext<SearchContextValue | undefined>(undefined);

export function useSearchDialog() {
  const ctx = React.useContext(SearchContext);
  if (!ctx) throw new Error("useSearchDialog must be used within SearchProvider");
  return ctx;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [history, setHistory] = useLocalStorage<string[]>("bd24news_search_history", []);
  const { data: results, isLoading } = useSearch(query);
  const { lang } = useLanguage();
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const submit = (value: string) => {
    const q = value.trim();
    if (!q) return;
    setHistory((prev) => [q, ...prev.filter((h) => h !== q)].slice(0, 8));
    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const clearHistory = () => setHistory([]);

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[15%] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0 sm:rounded-2xl">
          <DialogTitle className="sr-only">Search BD24News</DialogTitle>
          <div className="flex items-center gap-3 border-b p-4">
            <Search className="h-5 w-5 shrink-0 text-brand" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(query)}
              placeholder={lang === "bn" ? "খুঁজুন... সংবাদ, বিভাগ, লেখক" : "Search news, categories, authors..."}
              className="border-none bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {query.trim().length > 1 ? (
              <div className="space-y-0.5">
                {results && results.length > 0 ? (
                  results.slice(0, 8).map((r) => {
                    const cat = getCategory(r.category);
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setOpen(false);
                          setQuery("");
                          router.push(`/article/${r.slug}`);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                          <ImageWithFallback src={r.image} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold">{r.title}</p>
                          <span className="text-xs font-bold" style={{ color: r.categoryColor }}>
                            {cat?.nameBn ?? r.category}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <Search className="h-8 w-8" />
                    <p className="text-sm">{lang === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 p-2">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-brand" />
                    {lang === "bn" ? "ট্রেন্ডিং" : "Trending"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:border-brand hover:text-brand",
                          i === 0 && "border-brand bg-brand text-white hover:text-white",
                        )}
                      >
                        {i + 1}. {s}
                      </button>
                    ))}
                  </div>
                </div>
                {history.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5" />
                        {lang === "bn" ? "সাম্প্রতিক" : "Recent"}
                      </span>
                      <button onClick={clearHistory} className="text-[10px] text-brand hover:underline">
                        {lang === "bn" ? "মুছুন" : "Clear"}
                      </button>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {history.map((h) => (
                        <button
                          key={h}
                          onClick={() => submit(h)}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-medium transition-colors hover:bg-brand hover:text-white"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    type SpeechRecognitionLike = {
                      lang: string;
                      onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
                      start: () => void;
                    };
                    const Ctor = (window as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
                    if (typeof window !== "undefined" && Ctor) {
                      const rec = new Ctor();
                      rec.lang = "bn-BD";
                      rec.onresult = (e) => {
                        const first = e.results[0];
                        const firstItem = first?.[0];
                        const text = firstItem?.transcript ?? "";
                        if (text) {
                          setQuery(text);
                          submit(text);
                        }
                      };
                      rec.start();
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <Mic className="h-4 w-4" />
                  {lang === "bn" ? "ভয়েস সার্চ চালু করুন" : "Use voice search"}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {open && (
          <motion.div className="pointer-events-none fixed inset-0 z-40" aria-hidden />
        )}
      </AnimatePresence>
    </SearchContext.Provider>
  );
}
