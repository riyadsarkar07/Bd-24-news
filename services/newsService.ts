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
    id: (row.id as string) ?? (row.slug as string) ?? "",
    slug: (row.slug as string) ?? (row.id as string) ?? "",
    title: (row.title as string) ?? "",
    titleBn: (row.title_bn as string) ?? "",
    excerpt: (row.excerpt as string) ?? "",
    body: (row.body as string) ?? "",
    category: String(row.category ?? "bangladesh").trim().toLowerCase() || "bangladesh",
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

const LIST_COLUMNS =
  "id,slug,title,title_bn,excerpt,category,category_color,tags,author,author_name_bn,author_slug,author_avatar,author_role,cover_image,images,published_at,updated_at,views,likes,comments_count,reading_minutes,featured,breaking,trending,editor_pick,is_video,is_gallery,video_url,location,seo_title,seo_description,status";

const FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: PromiseLike<T>, ms = FETCH_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Supabase query timed out")), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function mapRows(data: unknown): Article[] {
  if (!Array.isArray(data)) return [];
  return data.map((r) => mapArticleRow(r as ArticleRow));
}

let publishedCache: { at: number; data: Article[] } | null = null;
const PUBLISHED_CACHE_MS = 30_000;
let publishedInFlight: Promise<Article[]> | null = null;

export async function getPublishedArticles(): Promise<Article[]> {
  const now = Date.now();
  if (publishedCache && now - publishedCache.at < PUBLISHED_CACHE_MS) {
    return publishedCache.data;
  }
  if (publishedInFlight) return publishedInFlight;

  publishedInFlight = (async () => {
    const supabase = getSupabase();
    if (!supabase) return publishedCache?.data ?? [];
    try {
      const { data, error } = await withTimeout(
        supabase.from("articles").select(LIST_COLUMNS).eq("status", "published").order("published_at", { ascending: false }),
      );
      if (error) {
        console.error("Supabase articles read failed:", error.message);
        return publishedCache?.data ?? [];
      }
      const articles = mapRows(data);
      publishedCache = { at: Date.now(), data: articles };
      return articles;
    } catch (err) {
      console.error("Supabase articles read failed:", err);
      return publishedCache?.data ?? [];
    } finally {
      publishedInFlight = null;
    }
  })();

  return publishedInFlight;
}

const POLL_MS = 60000;

export function subscribeArticles(listener: (articles: Article[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    try {
      const articles = await getPublishedArticles();
      if (!stopped && articles.length > 0) listener(articles);
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

async function queryArticles(options: ArticleQueryOptions = {}): Promise<Article[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    let q = supabase.from("articles").select(LIST_COLUMNS).eq("status", "published");
    if (options.category) q = q.eq("category", options.category);
    if (options.featured !== undefined) q = q.eq("featured", options.featured);
    if (options.breaking !== undefined) q = q.eq("breaking", options.breaking);
    if (options.trending !== undefined) q = q.eq("trending", options.trending);
    if (options.editorPick !== undefined) q = q.eq("editor_pick", options.editorPick);
    if (options.tag) q = q.contains("tags", [options.tag]);
    if (options.search) {
      const term = options.search.replace(/[%_,]/g, " ").trim();
      if (term) q = q.or(`title.ilike.%${term}%,title_bn.ilike.%${term}%,excerpt.ilike.%${term}%`);
    }
    if (options.sort === "popular") q = q.order("views", { ascending: false });
    else if (options.sort === "oldest") q = q.order("published_at", { ascending: true });
    else q = q.order("published_at", { ascending: false });
    if (options.limit) {
      q = q.limit(Math.min(Math.max(options.limit, 1), 100));
    }
    const { data, error } = await withTimeout(q);
    if (error) {
      console.error("Supabase articles query failed:", error.message);
      return null;
    }
    return mapRows(data);
  } catch (err) {
    console.error("Supabase articles query failed:", err);
    return null;
  }
}

export async function getArticles(options: ArticleQueryOptions = {}): Promise<Article[]> {
  const queried = await queryArticles(options);
  if (queried) return queried;
  const all = await getPublishedArticles();
  return filterAndSort(all, options);
}

export async function getHomepageData() {
  const all = await getPublishedArticles();
  const featured = filterAndSort(all, { featured: true, limit: 9 });
  const latest = filterAndSort(all, { sort: "latest", limit: 8 });
  return {
    heroArticles: featured.length > 0 ? featured : filterAndSort(all, { sort: "latest", limit: 9 }),
    breakingArticles: filterAndSort(all, { breaking: true, limit: 5 }),
    latest,
    editorPicks: filterAndSort(all, { editorPick: true, limit: 4 }),
    tech: filterAndSort(all, { category: "technology", limit: 6 }),
    sports: filterAndSort(all, { category: "sports", limit: 6 }),
    entertainment: filterAndSort(all, { category: "entertainment", limit: 6 }),
    politics: filterAndSort(all, { category: "politics", limit: 6 }),
    economy: filterAndSort(all, { category: "economy", limit: 6 }),
    health: filterAndSort(all, { category: "health", limit: 6 }),
    international: filterAndSort(all, { category: "international", limit: 6 }),
    education: filterAndSort(all, { category: "education", limit: 6 }),
    opinion: filterAndSort(all, { category: "opinion", limit: 6 }),
    videos: filterAndSort(all, { category: "entertainment", limit: 4 }),
    gallery: filterAndSort(all, { category: "travel", limit: 5 }),
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from("articles").select("*").eq("status", "published").eq("slug", slug).limit(1).maybeSingle(),
      );
      if (!error && data) return mapArticleRow(data as ArticleRow);
    } catch (err) {
      console.error("Supabase article by slug read failed:", err);
    }
  }
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
