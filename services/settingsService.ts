import { getSupabase } from "@/lib/supabase/client";

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  description: string;
  siteUrl: string;
  timezone: string;
  locale: string;
  defaultDarkMode: boolean;
  accentColor: string;
  primaryFont: string;
  enableEnglish: boolean;
  defaultLanguage: string;
  pushNotifications: boolean;
  breakingAlerts: boolean;
  emailOnComment: boolean;
  forceHttps: boolean;
  csp: string;
  social: {
    facebook: string;
    twitter: string;
    youtube: string;
    instagram: string;
    tiktok: string;
    telegram: string;
  };
}

export interface SeoSettings {
  defaultTitle: string;
  defaultDescription: string;
  keywords: string;
  allowIndexing: boolean;
  autoSitemap: boolean;
  jsonLd: boolean;
  categoryPages: string;
  tagPages: string;
  authorPages: string;
  canonicalBase: string;
  ogImageEnabled: boolean;
  ogTitle: string;
  ogDescription: string;
  twitterHandle: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "BD24News",
  siteTagline: "Bangladesh's Leading News Portal",
  description: "Latest Bangladeshi news, sports, economy, technology and more, updated 24/7.",
  siteUrl: "https://bd24news.vercel.app",
  timezone: "asia/dhaka",
  locale: "bn",
  defaultDarkMode: true,
  accentColor: "#E50914",
  primaryFont: "hind",
  enableEnglish: true,
  defaultLanguage: "bn",
  pushNotifications: true,
  breakingAlerts: true,
  emailOnComment: false,
  forceHttps: true,
  csp: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline';",
  social: {
    facebook: "https://facebook.com/bd24news",
    twitter: "https://x.com/bd24news",
    youtube: "https://youtube.com/@bd24news",
    instagram: "https://instagram.com/bd24news",
    tiktok: "https://tiktok.com/@bd24news",
    telegram: "https://t.me/bd24news",
  },
};

export const DEFAULT_SEO: SeoSettings = {
  defaultTitle: "BD24News — Bangladesh's Leading News Portal",
  defaultDescription: "Latest Bangladeshi news, sports, economy, technology and more.",
  keywords: "bangladesh news, cricket, economy, technology, sports, dhaka",
  allowIndexing: true,
  autoSitemap: true,
  jsonLd: true,
  categoryPages: "dynamic",
  tagPages: "noindex",
  authorPages: "index",
  canonicalBase: "https://bd24news.vercel.app",
  ogImageEnabled: true,
  ogTitle: "BD24News",
  ogDescription: "Breaking news from Bangladesh and around the world.",
  twitterHandle: "@bd24news",
};

function mergeSettings(data: Record<string, unknown> | undefined, defaults: SiteSettings): SiteSettings {
  if (!data) return defaults;
  const social = (data.social as Partial<SiteSettings["social"]>) ?? {};
  return {
    ...defaults,
    ...(data as Partial<SiteSettings>),
    social: { ...defaults.social, ...social },
  };
}

function mergeSeo(data: Record<string, unknown> | undefined, defaults: SeoSettings): SeoSettings {
  if (!data) return defaults;
  return { ...defaults, ...(data as Partial<SeoSettings>) };
}

async function getSettingJson(key: string): Promise<Record<string, unknown> | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;
  try {
    const { data } = await supabase.from("settings").select("value").eq("key", key).limit(1).maybeSingle();
    return (data?.value as Record<string, unknown> | undefined) ?? undefined;
  } catch (err) {
    console.error("Supabase settings read failed:", err);
    return undefined;
  }
}

async function saveSettingJson(key: string, value: Record<string, unknown>): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export async function getSettings(): Promise<SiteSettings> {
  const data = await getSettingJson("general");
  return mergeSettings(data, DEFAULT_SETTINGS);
}

export async function saveSettings(input: Partial<SiteSettings>): Promise<void> {
  const current = await getSettings();
  await saveSettingJson("general", { ...current, ...input, updatedAt: new Date().toISOString() } as Record<string, unknown>);
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const data = await getSettingJson("seo");
  return mergeSeo(data, DEFAULT_SEO);
}

export async function saveSeoSettings(input: Partial<SeoSettings>): Promise<void> {
  const current = await getSeoSettings();
  await saveSettingJson("seo", { ...current, ...input, updatedAt: new Date().toISOString() } as Record<string, unknown>);
}
