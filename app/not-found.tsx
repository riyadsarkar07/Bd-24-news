"use client";
import { useLanguage } from "@/providers/language-provider";
import { useReaderTitle } from "@/hooks/use-reader-title";
import Link from "next/link";
import { Compass, Home, Newspaper, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotFoundSuggestions } from "@/features/not-found/not-found-suggestions";

export default function NotFound() {
  const { lang } = useLanguage();
  useReaderTitle(lang === "bn" ? "পেজটি পাওয়া যায়নি | বিডি২৪ নিউজ" : "Page not found | BD24News");
  return (
    <div className="relative container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        <p className="font-bengali text-[7rem] font-black leading-none text-brand/10 sm:text-[9rem]">{lang === "bn" ? "৪০৪" : "404"}</p>
        <Compass className="absolute inset-0 m-auto h-20 w-20 animate-spin-slow text-brand sm:h-24 sm:w-24" />
      </div>
      <h1 className="relative mt-4 font-bengali text-3xl font-black">{lang === "bn" ? "পেজটি পাওয়া যায়নি" : "Page not found"}</h1>
      <p className="relative mt-2 max-w-md text-pretty text-muted-foreground">
        {lang === "bn" ? "আপনি যে পেজটি খুঁজছেন তা সরানো হয়েছে বা আর বিদ্যমান নেই। হোমে ফিরে গিয়ে বা সার্চ করে দেখুন।" : "This page may have moved. Visit the homepage or search for a story."}
      </p>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button>
            <Home className="h-4 w-4" /> {lang === "bn" ? "হোম" : "Home"}
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline">
            <Search className="h-4 w-4" /> {lang === "bn" ? "সার্চ" : "Search"}
          </Button>
        </Link>
        <Link href="/latest">
          <Button variant="outline">
            <Newspaper className="h-4 w-4" /> {lang === "bn" ? "সর্বশেষ" : "Latest"}
          </Button>
        </Link>
      </div>

      <NotFoundSuggestions />
    </div>
  );
}
