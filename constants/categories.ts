import type { Category } from "@/types";

export const categories: Category[] = [
  { slug: "bangladesh", name: "Bangladesh", nameBn: "বাংলাদেশ", description: "সবচেয়ে নতুন দেশের খবর", color: "#E50914", icon: "flag" },
  { slug: "international", name: "International", nameBn: "আন্তর্জাতিক", description: "বিশ্বজুড়ে খবর", color: "#2563EB", icon: "globe" },
  { slug: "politics", name: "Politics", nameBn: "রাজনীতি", description: "রাজনৈতিক বিশ্লেষণ ও খবর", color: "#7C3AED", icon: "landmark" },
  { slug: "economy", name: "Economy", nameBn: "অর্থনীতি", description: "অর্থনীতি ও বাজার", color: "#059669", icon: "trending-up" },
  { slug: "sports", name: "Sports", nameBn: "খেলাধুলা", description: "ক্রীড়া জগতের খবর", color: "#22C55E", icon: "trophy" },
  { slug: "entertainment", name: "Entertainment", nameBn: "বিনোদন", description: "চলচ্চিত্র ও বিনোদন", color: "#F59E0B", icon: "clapperboard" },
  { slug: "technology", name: "Technology", nameBn: "প্রযুক্তি", description: "প্রযুক্তি জগত", color: "#0891B2", icon: "cpu" },
  { slug: "education", name: "Education", nameBn: "শিক্ষা", description: "শিক্ষা সংবাদ", color: "#F97316", icon: "graduation-cap" },
  { slug: "health", name: "Health", nameBn: "স্বাস্থ্য", description: "স্বাস্থ্য সচেতনতা", color: "#EF4444", icon: "heart-pulse" },
  { slug: "lifestyle", name: "Lifestyle", nameBn: "লাইফস্টাইল", description: "জীবনযাপন", color: "#EC4899", icon: "sparkles" },
  { slug: "opinion", name: "Opinion", nameBn: "মতামত", description: "বিশ্লেষকদের মত", color: "#64748B", icon: "message-square-quote" },
  { slug: "crime", name: "Crime", nameBn: "অপরাধ", description: "অপরাধ সংবাদ", color: "#18181B", icon: "shield-alert" },
  { slug: "religion", name: "Religion", nameBn: "ধর্ম", description: "ধর্মীয় খবর", color: "#16A34A", icon: "moon" },
  { slug: "travel", name: "Travel", nameBn: "ভ্রমণ", description: "ভ্রমণ গাইড", color: "#0EA5E9", icon: "plane" },
  { slug: "jobs", name: "Jobs", nameBn: "চাকরি", description: "চাকরির খবর", color: "#6366F1", icon: "briefcase" },
];

export const secondaryCategories: { slug: string; name: string; nameBn: string; href: string; color: string }[] = [
  { slug: "latest", name: "Latest", nameBn: "সর্বশেষ", href: "/latest", color: "#E50914" },
  { slug: "videos", name: "Videos", nameBn: "ভিডিও", href: "/videos", color: "#DC2626" },
  { slug: "gallery", name: "Photo Gallery", nameBn: "ফটো গ্যালারি", href: "/gallery", color: "#2563EB" },
  { slug: "live-tv", name: "Live TV", nameBn: "লাইভ টিভি", href: "/live-tv", color: "#DC2626" },
  { slug: "breaking-news", name: "Breaking", nameBn: "ব্রেকিং নিউজ", href: "/breaking-news", color: "#E50914" },
  { slug: "archive", name: "Archive", nameBn: "আর্কাইভ", href: "/archive", color: "#475569" },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryBySlug(slug: string): Category {
  return (
    categories.find((c) => c.slug === slug) ?? {
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      nameBn: slug,
      description: "",
      color: "#E50914",
      icon: "newspaper",
    }
  );
}
