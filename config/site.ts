export const siteConfig = {
  name: "BD24News",
  nameBn: "বিডি২৪ নিউজ",
  tagline: "সত্যের সাথে সবসময়",
  taglineEn: "Always with the truth",
  description:
    "BD24News — Bangladesh's premium news portal covering breaking news, politics, economy, sports, entertainment, technology, and more. সত্যের সাথে সবসময়।",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bd24news.vercel.app",
  locale: "bn_BD",
  ogImage: "/images/og-image.svg",
  keywords: [
    "BD24News",
    "বিডি২৪ নিউজ",
    "Bangladesh news",
    "bangla news",
    "breaking news",
    "ঢাকা",
    "Dhaka",
    "news portal",
    "politics",
    "economy",
    "sports",
    "technology",
  ],
  twitterHandle: "@bd24news",
  email: "bd24news@tensi.org",
  phone: "+8801700000011",
  developer: "Riyad",
  address: "Level 12, Panthapath, Dhaka 1205, Bangladesh",
  establishedYear: 2015,
  adSenseId: "",
} as const;

export type SiteConfig = typeof siteConfig;
