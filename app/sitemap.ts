import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/services/newsService";
import { categories } from "@/constants/categories";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const base = siteConfig.url;
  const articles = await getPublishedArticles();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/latest`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/breaking-news`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/videos`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/live-tv`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/archive`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/markets`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/weather`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/prayer-times`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/authors`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/advertise`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/article/${a.slug}`,
    lastModified: a.updatedAt || a.publishedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const authorRoutes: MetadataRoute.Sitemap = articles
    .filter((a, i, arr) => arr.findIndex((x) => x.author === a.author) === i)
    .map((a) => ({
      url: `${base}/authors/${a.author}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...authorRoutes];
}
