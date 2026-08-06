import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { NewsListing } from "@/features/news-listing/listing-page";
import { getArticles } from "@/services/newsService";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Breaking News — ব্রেকিং নিউজ",
  description: `সবচেয়ে গুরুত্বপূর্ণ ও জরুরি খবর। ${siteConfig.name} — সত্যের সাথে সবসময়।`,
  alternates: { canonical: `${siteConfig.url}/breaking-news` },
};

export const dynamic = "force-dynamic";

export default async function BreakingNewsPage() {
  const initialData = await getArticles({ breaking: true, limit: 12 });
  return (
    <NewsListing
      title="Breaking News"
      titleBn="ব্রেকিং নিউজ"
      icon={<Flame className="h-4 w-4" />}
      color="#DC2626"
      breadcrumb="ব্রেকিং নিউজ"
      initialData={initialData}
      filters={[
        { label: "সব", value: "all", opts: { breaking: true } },
        { label: "সর্বশেষ", value: "latest", opts: { breaking: true, sort: "latest" as const } },
        { label: "জনপ্রিয়", value: "popular", opts: { breaking: true, sort: "popular" as const } },
      ]}
    />
  );
}
