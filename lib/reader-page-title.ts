import { getCategory } from "@/constants/categories";
import { siteConfig } from "@/config/site";
import type { Language } from "@/providers/language-provider";

const pages: Record<string, [string, string]> = {
  "/": ["আজকের খবর", "Today's news"],
  "/latest": ["সর্বশেষ খবর", "Latest News"],
  "/breaking-news": ["ব্রেকিং নিউজ", "Breaking News"],
  "/about": ["আমাদের সম্পর্কে", "About Us"],
  "/advertise": ["বিজ্ঞাপন", "Advertise"],
  "/archive": ["আর্কাইভ", "Archive"],
  "/authors": ["লেখকবৃন্দ", "Authors"],
  "/contact": ["যোগাযোগ", "Contact"],
  "/cookie-policy": ["কুকি নীতি", "Cookie Policy"],
  "/gallery": ["ফটো গ্যালারি", "Photo Gallery"],
  "/live-tv": ["লাইভ টিভি", "Live TV"],
  "/login": ["লগইন", "Sign In"],
  "/2fa": ["দুই ধাপে যাচাই", "Two-Factor Authentication"],
  "/forgot-password": ["পাসওয়ার্ড পুনরুদ্ধার", "Forgot Password"],
  "/reset-password": ["নতুন পাসওয়ার্ড", "Reset Password"],
  "/verify-email": ["ইমেইল যাচাই", "Verify Email"],
  "/markets": ["বাজার", "Markets"],
  "/prayer-times": ["নামাজের সময়সূচি", "Prayer Times"],
  "/privacy-policy": ["গোপনীয়তা নীতি", "Privacy Policy"],
  "/search": ["অনুসন্ধান", "Search"],
  "/terms": ["ব্যবহারের শর্তাবলী", "Terms of Service"],
  "/videos": ["ভিডিও", "Videos"],
  "/weather": ["আবহাওয়া", "Weather"],
};

export function readerPageTitle(path: string, lang: Language) {
  const category = getCategory(path.replace(/^\/(?:category\/)?/, ""));
  const name = category
    ? (lang === "bn" ? category.nameBn : category.name)
    : pages[path]?.[lang === "bn" ? 0 : 1];
  return name && `${name} | ${lang === "bn" ? siteConfig.nameBn : siteConfig.name}`;
}
