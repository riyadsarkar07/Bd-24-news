import type { Article, Author, Comment, SearchResult } from "@/types";
import { getSupabase } from "@/lib/supabase/client";

export interface ArticleQueryOptions {
  category?: string;
  limit?: number;
  featured?: boolean;
  breaking?: boolean;
  trending?: boolean;
  editorPick?: boolean;
  tag?: string;
  search?: string;
  sort?: "latest" | "popular" | "oldest";
}

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/^-+|-+$/g, "");

type ArticleRow = Record<string, unknown>;

export function mapArticleRow(row: ArticleRow): Article {
  return {
    id: (row.slug as string) ?? (row.id as string) ?? "",
    slug: (row.slug as string) ?? (row.id as string) ?? "",
    title: (row.title as string) ?? "",
    titleBn: (row.title_bn as string) ?? "",
    excerpt: (row.excerpt as string) ?? "",
    body: (row.body as string) ?? "",
    category: (row.category as string) ?? "bangladesh",
    categoryColor: (row.category_color as string) ?? "#E50914",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    author: (row.author as string) ?? "Riyad",
    authorNameBn: (row.author_name_bn as string) ?? "",
    authorSlug: (row.author_slug as string) || slugify((row.author as string) ?? ""),
    authorAvatar: (row.author_avatar as string) ?? "",
    authorRole: (row.author_role as string) ?? "Editor",
    coverImage: (row.cover_image as string) ?? "",
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    publishedAt: (row.published_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
    views: Number(row.views ?? 0),
    likes: Number(row.likes ?? 0),
    commentsCount: Number(row.comments_count ?? 0),
    readingMinutes: Number(row.reading_minutes ?? 0),
    featured: Boolean(row.featured),
    breaking: Boolean(row.breaking),
    trending: Boolean(row.trending),
    editorPick: Boolean(row.editor_pick),
    isVideo: Boolean(row.is_video),
    isGallery: Boolean(row.is_gallery),
    videoUrl: (row.video_url as string | null) ?? null,
    location: (row.location as string) ?? "",
    seoTitle: (row.seo_title as string) ?? "",
    seoDescription: (row.seo_description as string) ?? "",
    status: (row.status as "published" | "draft") ?? "published",
  };
}

export function filterAndSort(articles: Article[], options: ArticleQueryOptions = {}): Article[] {
  let result = [...articles];
  if (options.category) {
    result = result.filter((a) => a.category === options.category);
  }
  if (options.featured !== undefined) {
    result = result.filter((a) => a.featured === options.featured);
  }
  if (options.breaking !== undefined) {
    result = result.filter((a) => a.breaking === options.breaking);
  }
  if (options.trending !== undefined) {
    result = result.filter((a) => a.trending === options.trending);
  }
  if (options.editorPick !== undefined) {
    result = result.filter((a) => a.editorPick === options.editorPick);
  }
  if (options.tag) {
    result = result.filter((a) => a.tags.includes(options.tag as string));
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.titleBn.includes(options.search as string) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  switch (options.sort) {
    case "popular":
      result = result.sort((a, b) => b.views - a.views);
      break;
    case "oldest":
      result = result.sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt));
      break;
    default:
      result = result.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }
  if (options.limit) {
    result = result.slice(0, options.limit);
  }
  return result;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("articles").select("*").eq("status", "published");
    return (data ?? []).map((r) => mapArticleRow(r as ArticleRow));
  } catch (err) {
    console.error("Supabase articles read failed:", err);
    return [];
  }
}

const POLL_MS = 15000;

export function subscribeArticles(listener: (articles: Article[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    try {
      const articles = await getPublishedArticles();
      if (!stopped) listener(articles);
    } catch (err) {
      console.error("Supabase articles poll error:", err);
    }
  };
  void run();
  const timer = window.setInterval(() => void run(), POLL_MS);
  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

export async function getArticles(options: ArticleQueryOptions = {}): Promise<Article[]> {
  const all = await getPublishedArticles();
  return filterAndSort(all, options);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const all = await getPublishedArticles();
  return all.find((a) => a.slug === slug);
}

export async function getRelatedArticles(article: Article, limit = 6): Promise<Article[]> {
  const all = await getPublishedArticles();
  const sameCategory = all
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, limit);
  if (sameCategory.length >= limit) return sameCategory;
  const others = all.filter((a) => a.category !== article.category && a.id !== article.id).slice(0, limit - sameCategory.length);
  return [...sameCategory, ...others];
}

export async function getMostRead(limit = 6): Promise<Article[]> {
  const all = await getPublishedArticles();
  return filterAndSort(all, { sort: "popular", limit });
}

export async function getTrending(limit = 6): Promise<Article[]> {
  const all = await getPublishedArticles();
  return filterAndSort(all, { trending: true, limit });
}

export async function getEditorPicks(limit = 6): Promise<Article[]> {
  const all = await getPublishedArticles();
  return filterAndSort(all, { editorPick: true, limit });
}

export async function searchNews(query: string, limit = 10): Promise<SearchResult[]> {
  const results = await getArticles({ search: query, limit });
  return results.map((a) => ({
    id: a.id,
    title: a.titleBn,
    category: a.category,
    categoryColor: a.categoryColor,
    image: a.coverImage,
    slug: a.slug,
    publishedAt: a.publishedAt,
  }));
}

export function mapAuthorRow(row: Record<string, unknown>): Author {
  return {
    slug: (row.slug as string) ?? (row.id as string) ?? "",
    name: (row.name as string) ?? "",
    nameBn: (row.name_bn as string) ?? "",
    role: (row.role as string) ?? "",
    email: (row.email as string) ?? "",
    bio: (row.bio as string) ?? "",
    avatar: (row.avatar as string) ?? "",
    cover: (row.cover as string) ?? "",
    followers: Number(row.followers ?? 0),
    articlesCount: Number(row.articles_count ?? 0),
    verified: Boolean(row.verified),
    social: (row.social as Author["social"]) ?? {},
  };
}

export async function getAuthors(): Promise<Author[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("authors").select("*").order("name_bn");
    return (data ?? []).map((r) => mapAuthorRow(r as Record<string, unknown>));
  } catch (err) {
    console.error("Supabase authors read failed:", err);
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  const all = await getAuthors();
  return all.find((a) => a.slug === slug);
}

export async function getAuthorArticles(slug: string): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all
    .filter((a) => slugify(a.author) === slug || a.authorSlug === slug)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export function mapCommentRow(id: string, row: Record<string, unknown>, articleId: string): Comment {
  return {
    id,
    articleId: (row.article_id as string) ?? articleId,
    author: (row.author as string) ?? "Anonymous",
    avatar: (row.avatar as string) ?? "",
    content: (row.content as string) ?? "",
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    likes: Number(row.likes ?? 0),
    replies: [],
  };
}

export function subscribeComments(articleId: string, listener: (comments: Comment[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.from("comments").select("*").eq("article_id", articleId);
      if (!stopped) listener((data ?? []).map((r) => mapCommentRow(String(r.id), r as Record<string, unknown>, articleId)));
    } catch (err) {
      console.error("Supabase comments poll error:", err);
    }
  };
  void run();
  const timer = window.setInterval(() => void run(), POLL_MS);
  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

export async function getComments(articleId: string): Promise<Comment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("comments").select("*").eq("article_id", articleId);
    return (data ?? []).map((r) => mapCommentRow(String(r.id), r as Record<string, unknown>, articleId));
  } catch (err) {
    console.error("Supabase comments read failed:", err);
    return [];
  }
}

export async function getArchiveYears(): Promise<number[]> {
  const all = await getPublishedArticles();
  const years = [...new Set(all.map((a) => new Date(a.publishedAt).getFullYear()))].sort((a, b) => b - a);
  return years;
}
