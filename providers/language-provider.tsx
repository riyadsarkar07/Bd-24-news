"use client";

import * as React from "react";

export type Language = "bn" | "en";

const translations = {
  bn: {
    breaking: "ব্রেকিং নিউজ",
    latest: "সর্বশেষ",
    topStories: "শীর্ষ সংবাদ",
    editorsPick: "সম্পাদকের পছন্দ",
    trending: "ট্রেন্ডিং",
    mostRead: "সর্বাধিক পঠিত",
    popularToday: "আজকের জনপ্রিয়",
    technology: "প্রযুক্তি",
    sports: "খেলাধুলা",
    entertainment: "বিনোদন",
    politics: "রাজনীতি",
    economy: "অর্থনীতি",
    health: "স্বাস্থ্য",
    international: "আন্তর্জাতিক",
    education: "শিক্ষা",
    opinion: "মতামত",
    videos: "ভিডিও",
    gallery: "ফটো গ্যালারি",
    shortNews: "সংক্ষিপ্ত খবর",
    liveUpdate: "লাইভ আপডেট",
    weather: "আবহাওয়া",
    prayerTimes: "নামাজের সময়সূচি",
    stockMarket: "শেয়ারবাজার",
    currency: "মুদ্রা",
    goldPrice: "সোনার দাম",
    crypto: "ক্রিপ্টোকারেন্সি",
    readMore: "বিস্তারিত পড়ুন",
    viewAll: "সব দেখুন",
    search: "অনুসন্ধান",
    watchLive: "লাইভ দেখুন",
    subscribe: "সাবস্ক্রাইব",
    newsletter: "নিউজলেটার",
    newsletterDesc: "প্রতিদিনের খবর আপনার ইমেইলে পান",
    followUs: "আমাদের অনুসরণ করুন",
    aboutUs: "আমাদের সম্পর্কে",
    contact: "যোগাযোগ",
    advertise: "বিজ্ঞাপন",
    privacy: "গোপনীয়তা নীতি",
    terms: "ব্যবহারের শর্তাবলী",
    cookie: "কুকি নীতি",
    related: "সম্পর্কিত খবর",
    comments: "মন্তব্য",
    author: "লেখক",
    publishedAt: "প্রকাশিত",
    views: "দর্শন",
    share: "শেয়ার করুন",
    home: "হোম",
    categories: "বিভাগ",
    readTime: "মিনিট পড়া",
    backToTop: "উপরে ফিরে যান",
    allRightsReserved: "সর্বস্বত্ব সংরক্ষিত",
    liveTv: "লাইভ টিভি",
    jobs: "চাকরি",
    travel: "ভ্রমণ",
    crime: "অপরাধ",
    religion: "ধর্ম",
    lifestyle: "লাইফস্টাইল",
    archive: "আর্কাইভ",
  },
  en: {
    breaking: "Breaking News",
    latest: "Latest",
    topStories: "Top Stories",
    editorsPick: "Editor's Pick",
    trending: "Trending",
    mostRead: "Most Read",
    popularToday: "Popular Today",
    technology: "Technology",
    sports: "Sports",
    entertainment: "Entertainment",
    politics: "Politics",
    economy: "Economy",
    health: "Health",
    international: "International",
    education: "Education",
    opinion: "Opinion",
    videos: "Videos",
    gallery: "Photo Gallery",
    shortNews: "Short News",
    liveUpdate: "Live Update",
    weather: "Weather",
    prayerTimes: "Prayer Times",
    stockMarket: "Stock Market",
    currency: "Currency",
    goldPrice: "Gold Price",
    crypto: "Cryptocurrency",
    readMore: "Read More",
    viewAll: "View All",
    search: "Search",
    watchLive: "Watch Live",
    subscribe: "Subscribe",
    newsletter: "Newsletter",
    newsletterDesc: "Get the daily briefing in your inbox",
    followUs: "Follow Us",
    aboutUs: "About Us",
    contact: "Contact",
    advertise: "Advertise",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookie: "Cookie Policy",
    related: "Related News",
    comments: "Comments",
    author: "Author",
    publishedAt: "Published",
    views: "Views",
    share: "Share",
    home: "Home",
    categories: "Categories",
    readTime: "min read",
    backToTop: "Back to top",
    allRightsReserved: "All rights reserved",
    liveTv: "Live TV",
    jobs: "Jobs",
    travel: "Travel",
    crime: "Crime",
    religion: "Religion",
    lifestyle: "Lifestyle",
    archive: "Archive",
  },
} as const;

type TranslationKey = keyof (typeof translations)["en"];

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Language>(() => {
    if (typeof window === "undefined") return "bn";
    return (localStorage.getItem("bd24news_lang") as Language) ?? "bn";
  });

  const toggle = React.useCallback(() => {
    setLang((prev) => {
      const next = prev === "bn" ? "en" : "bn";
      localStorage.setItem("bd24news_lang", next);
      document.documentElement.lang = next === "bn" ? "bn" : "en";
      return next;
    });
  }, []);

  const t = React.useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations.en[key],
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
