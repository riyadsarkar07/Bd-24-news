import type { Metadata } from "next";
import { Zap } from "lucide-react";
import { NewsListing } from "@/features/news-listing/listing-page";
import { getArticles } from "@/services/newsService";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Latest News — সর্বশেষ খবর",
  description: `সর্বশেষ খবর ও আপডেট। ${siteConfig.tagline} — ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/latest` },
};

export const dynamic = "force-dynamic";

export default async function LatestPage() {
  const initialData = await getArticles({ sort: "latest", limit: 12 });
  return (
    <NewsListing
      title="Latest News"
      titleBn="সর্বশেষ খবর"
      icon={<Zap className="h-4 w-4" />}
      breadcrumb="সর্বশেষ"
      initialData={initialData}
      filters={[
        { label: "সব", labelEn: "All", value: "all", opts: { sort: "latest" as const } },
        { label: "ব্রেকিং", labelEn: "Breaking", value: "breaking", opts: { breaking: true, sort: "latest" as const } },
        { label: "ট্রেন্ডিং", labelEn: "Trending", value: "trending", opts: { trending: true, sort: "latest" as const } },
        { label: "সম্পাদকের পছন্দ", labelEn: "Editor’s picks", value: "editors", opts: { editorPick: true, sort: "latest" as const } },
      ]}
    />
  );
}
