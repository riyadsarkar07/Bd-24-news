import Link from "next/link";
import { Compass, Home, Newspaper, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotFoundSuggestions } from "@/features/not-found/not-found-suggestions";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="relative">
        <p className="font-bengali text-[9rem] font-black leading-none text-brand/10">404</p>
        <Compass className="absolute inset-0 m-auto h-24 w-24 animate-spin-slow text-brand" />
      </div>
      <h1 className="mt-4 font-bengali text-3xl font-black">পেজটি পাওয়া যায়নি</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        আপনি যে পেজটি খুঁজছেন তা সরানো হয়েছে বা আর বিদ্যমান নেই। হোমে ফিরে গিয়ে বা সার্চ করে দেখুন।
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button>
            <Home className="h-4 w-4" /> হোম
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline">
            <Search className="h-4 w-4" /> সার্চ
          </Button>
        </Link>
        <Link href="/latest">
          <Button variant="outline">
            <Newspaper className="h-4 w-4" /> সর্বশেষ
          </Button>
        </Link>
      </div>

      <NotFoundSuggestions />
    </div>
  );
}
