import type { Metadata } from "next";
import { getArticles, getEditorPicks } from "@/services/newsService";
import { HeroSlider } from "@/features/home/hero-slider";
import { WidgetBar } from "@/features/home/widget-bar";
import { LatestSection } from "@/features/home/latest-section";
import { BreakingSpotlight } from "@/features/home/breaking-section";
import { CategorySection } from "@/features/home/category-section";
import { VideoSection, GallerySection } from "@/features/home/media-sections";
import { AdSlot } from "@/components/shared/ad-slot";
import { NewsletterCTA } from "@/components/shared/newsletter-cta";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME ?? "BD24News"} — সর্বশেষ খবর, বাংলাদেশ ও বিশ্ব`,
  description:
    "বাংলাদেশ ও বিশ্বের সর্বশেষ খবর, রাজনীতি, অর্থনীতি, খেলাধুলা, প্রযুক্তি, বিনোদন। সত্যের সাথে সবসময় — BD24News.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [heroArticles, breakingArticles, latest, editorPicks, tech, sports, entertainment, politics, economy, health, international, education, opinion, videos, gallery] =
    await Promise.all([
      getArticles({ featured: true, limit: 9 }),
      getArticles({ breaking: true, limit: 5 }),
      getArticles({ sort: "latest", limit: 8 }),
      getEditorPicks(4),
      getArticles({ category: "technology", limit: 6 }),
      getArticles({ category: "sports", limit: 6 }),
      getArticles({ category: "entertainment", limit: 6 }),
      getArticles({ category: "politics", limit: 6 }),
      getArticles({ category: "economy", limit: 6 }),
      getArticles({ category: "health", limit: 6 }),
      getArticles({ category: "international", limit: 6 }),
      getArticles({ category: "education", limit: 6 }),
      getArticles({ category: "opinion", limit: 6 }),
      getArticles({ category: "entertainment", limit: 4 }),
      getArticles({ category: "travel", limit: 5 }),
    ]);

  return (
    <>
      <HeroSlider articles={heroArticles} />
      <WidgetBar />
      <BreakingSpotlight initialData={breakingArticles} />
      <div className="container-page">
        <AdSlot size="banner" />
      </div>
      <LatestSection initialData={{ latest, editorPicks }} />
      <div className="container-page space-y-12 py-6">
        <CategorySection slug="technology" initialData={tech} priority />
        <CategorySection slug="sports" initialData={sports} />
      </div>
      <VideoSection initialData={videos} />
      <div className="container-page space-y-12 py-6">
        <CategorySection slug="entertainment" initialData={entertainment} />
        <CategorySection slug="politics" initialData={politics} />
      </div>
      <GallerySection initialData={gallery} />
      <div className="container-page space-y-12 py-6">
        <CategorySection slug="economy" initialData={economy} />
        <CategorySection slug="health" initialData={health} />
      </div>
      <div className="container-page py-6">
        <AdSlot size="leaderboard" />
      </div>
      <div className="container-page space-y-12 py-6">
        <CategorySection slug="international" initialData={international} />
        <CategorySection slug="education" initialData={education} />
        <CategorySection slug="opinion" initialData={opinion} />
      </div>
      <NewsletterCTA />
    </>
  );
}
