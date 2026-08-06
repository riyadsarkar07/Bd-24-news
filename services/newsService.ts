import { articles as seedArticles } from "@/data/articles";
import { authors } from "@/data/authors";
import type { Article, Author, Comment, SearchResult } from "@/types";
import { getFirebaseDb } from "@/lib/firebase/client";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";

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

export function mapFirestoreDoc(id: string, data: Record<string, unknown>): Article {
  return {
    id: (data.id as string) ?? id,
    slug: (data.slug as string) ?? id,
    title: (data.title as string) ?? "",
    titleBn: (data.titleBn as string) ?? "",
    excerpt: (data.excerpt as string) ?? "",
    body: (data.body as string) ?? "",
    category: (data.category as string) ?? "bangladesh",
    categoryColor: (data.categoryColor as string) ?? "#E50914",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    author: (data.author as string) ?? "Riyad",
    authorNameBn: (data.authorNameBn as string) ?? "",
    authorSlug: (data.authorSlug as string) || slugify((data.author as string) ?? ""),
    authorAvatar: (data.authorAvatar as string) ?? "",
    authorRole: (data.authorRole as string) ?? "Editor",
    coverImage: (data.coverImage as string) ?? "",
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    publishedAt: (data.publishedAt as string) ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
    views: Number(data.views ?? 0),
    likes: Number(data.likes ?? 0),
    commentsCount: Number(data.commentsCount ?? 0),
    readingMinutes: Number(data.readingMinutes ?? 0),
    featured: Boolean(data.featured),
    breaking: Boolean(data.breaking),
    trending: Boolean(data.trending),
    editorPick: Boolean(data.editorPick),
    isVideo: Boolean(data.isVideo),
    isGallery: Boolean(data.isGallery),
    videoUrl: (data.videoUrl as string | null) ?? null,
    location: (data.location as string) ?? "",
    seoTitle: (data.seoTitle as string) ?? "",
    seoDescription: (data.seoDescription as string) ?? "",
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
  const db = getFirebaseDb();
  if (!db) return seedArticles;
  try {
    const q = query(collection(db, "articles"), where("status", "==", "published"));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => mapFirestoreDoc(d.id, d.data() as Record<string, unknown>));
    return docs;
  } catch (err) {
    console.error("Firestore read failed — falling back to offline data:", err);
    return seedArticles;
  }
}

export function subscribeArticles(listener: (articles: Article[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  const q = query(collection(db, "articles"), where("status", "==", "published"));
  return onSnapshot(
    q,
    (snap) => {
      listener(snap.docs.map((d) => mapFirestoreDoc(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => {
      console.error("Firestore articles snapshot error:", err);
    },
  );
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

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  return authors.find((a) => a.slug === slug);
}

export async function getAuthorArticles(slug: string): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all
    .filter((a) => slugify(a.author) === slug || a.authorSlug === slug)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export function mapCommentDoc(id: string, articleId: string, data: Record<string, unknown>): Comment {
  return {
    id,
    articleId: (data.articleId as string) ?? articleId,
    author: (data.author as string) ?? "Anonymous",
    avatar: (data.avatar as string) ?? "",
    content: (data.content as string) ?? "",
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    likes: Number(data.likes ?? 0),
    replies: Array.isArray(data.replies) ? (data.replies as Comment[]) : [],
  };
}

export function subscribeComments(articleId: string, listener: (comments: Comment[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  const q = query(collection(db, "comments"), where("articleId", "==", articleId));
  return onSnapshot(
    q,
    (snap) => listener(snap.docs.map((d) => mapCommentDoc(d.id, articleId, d.data() as Record<string, unknown>))),
    (err) => console.error("Firestore comments snapshot error:", err),
  );
}

export async function getComments(articleId: string): Promise<Comment[]> {
  const db = getFirebaseDb();
  if (db) {
    try {
      const q = query(collection(db, "comments"), where("articleId", "==", articleId));
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => mapCommentDoc(d.id, articleId, d.data() as Record<string, unknown>));
      if (docs.length > 0) return docs;
    } catch (err) {
      console.error("Firestore comments read failed:", err);
    }
  }
  return [
    {
      id: `${articleId}-c1`,
      articleId,
      author: "সুমন আহমেদ",
      avatar: "",
      content:
        "খুবই তথ্যবহুল এবং সময়োপযোগী প্রতিবেদন। এমন গঠনমূলক সাংবাদিকতা দেশের জন্য দরকার। ধন্যবাদ বিডি২৪নিউজকে।",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      likes: 24,
      replies: [
        {
          id: `${articleId}-c1r1`,
          articleId,
          author: "নাফিসা ইসলাম",
          avatar: "",
          content: "একমত। আশা করি বিষয়টি নিয়ে আরও বিস্তারিত প্রতিবেদন আসবে।",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likes: 8,
          replies: [],
        },
      ],
    },
    {
      id: `${articleId}-c2`,
      articleId,
      author: "Rafiul Kabir",
      avatar: "",
      content: "Great reporting as always. The data and sources cited here are credible.",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      likes: 12,
      replies: [],
    },
  ];
}

export async function getArchiveYears(): Promise<number[]> {
  const all = await getPublishedArticles();
  const years = [...new Set(all.map((a) => new Date(a.publishedAt).getFullYear()))].sort((a, b) => b - a);
  return years.length > 0 ? years : [2026, 2025, 2024, 2023, 2022];
}
