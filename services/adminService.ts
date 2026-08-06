import { articles as seedArticles } from "@/data/articles";
import type { Article } from "@/types";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { mapFirestoreDoc, slugify } from "@/services/newsService";

export type AdminStat = {
  key: string;
  value: number;
  delta: number;
};

export type ChartPoint = {
  label: string;
  views: number;
  articles: number;
};

export type ArticleStatus = "published" | "draft";

export interface ArticleInput {
  id?: string;
  slug?: string;
  titleBn: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  categoryColor?: string;
  tags: string[];
  featured: boolean;
  breaking: boolean;
  trending: boolean;
  editorPick: boolean;
  coverImage: string;
  images?: string[];
  author: string;
  authorNameBn?: string;
  authorSlug?: string;
  authorAvatar?: string;
  authorRole?: string;
  location?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: ArticleStatus;
  publishedAt?: string;
}

const DEFAULT_AUTHOR = { name: "Riyad", nameBn: "রিয়াদ", role: "Editor" };

function buildArticleDoc(input: ArticleInput, existing?: Article): Record<string, unknown> {
  const now = new Date().toISOString();
  const slug = input.slug?.trim() || slugify(input.title) || `article-${Date.now()}`;
  const category = input.category || "bangladesh";
  const categoryColor = input.categoryColor || "#E50914";
  const authorName = input.author?.trim() || DEFAULT_AUTHOR.name;
  const authorNameBn = input.authorNameBn?.trim() || DEFAULT_AUTHOR.nameBn;
  const authorRole = input.authorRole?.trim() || DEFAULT_AUTHOR.role;
  const status = input.status === "draft" ? "draft" : "published";
  const publishedAt = status === "published" ? input.publishedAt || now : existing?.publishedAt ?? "";
  const body = input.body || "";
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    id: input.id || slug,
    slug,
    titleBn: input.titleBn,
    title: input.title,
    excerpt: input.excerpt,
    body,
    category,
    categoryColor,
    tags: input.tags || [],
    author: authorName,
    authorNameBn,
    authorSlug: slugify(authorName),
    authorAvatar: input.authorAvatar || "",
    authorRole,
    coverImage: input.coverImage || "",
    images: input.images && input.images.length > 0 ? input.images : input.coverImage ? [input.coverImage] : [],
    publishedAt,
    updatedAt: now,
    createdAt: existing?.publishedAt ?? now,
    views: existing?.views ?? 0,
    likes: existing?.likes ?? 0,
    commentsCount: existing?.commentsCount ?? 0,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    featured: Boolean(input.featured),
    breaking: Boolean(input.breaking),
    trending: Boolean(input.trending),
    editorPick: Boolean(input.editorPick),
    isVideo: existing?.isVideo ?? false,
    isGallery: existing?.isGallery ?? false,
    videoUrl: existing?.videoUrl ?? null,
    location: input.location || "",
    seoTitle: input.seoTitle || "",
    seoDescription: input.seoDescription || "",
    status,
  };
}

export async function listAllArticles(): Promise<Article[]> {
  const db = getFirebaseDb();
  if (!db) {
    return seedArticles.map((a) => ({ ...a, status: (a.slug === "constitutional-issues" || a.slug === "flood-forecast" ? "draft" : "published") as Article["status"] }));
  }
  try {
    const q = query(collection(db, "articles"), orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return { ...mapFirestoreDoc(d.id, data), status: (data.status as ArticleStatus) ?? "published" };
    });
    return docs;
  } catch (err) {
    console.error("Firestore articles read failed:", err);
    return seedArticles.map((a) => ({ ...a, status: "published" as Article["status"] }));
  }
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const db = getFirebaseDb();
  if (!db) {
    return seedArticles.find((a) => a.id === id || a.slug === id);
  }
  try {
    const ref = doc(db, "articles", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Record<string, unknown>;
      return { ...mapFirestoreDoc(snap.id, data), status: (data.status as ArticleStatus) ?? "published" };
    }
    const all = await listAllArticles();
    return all.find((a) => a.slug === id);
  } catch (err) {
    console.error("Firestore article read failed:", err);
    return seedArticles.find((a) => a.id === id || a.slug === id);
  }
}

export async function saveArticle(input: ArticleInput, existingId?: string): Promise<{ id: string; slug: string }> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* environment variables.");
  const id = existingId || input.id || slugify(input.title) || `article-${Date.now()}`;
  const existing = existingId ? await getArticleById(existingId) : undefined;
  const payload = buildArticleDoc(input, existing);
  await setDoc(doc(db, "articles", id), payload, { merge: false });
  return { id, slug: payload.slug as string };
}

export async function deleteArticle(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "articles", id));
}

export async function duplicateArticle(id: string): Promise<{ id: string; slug: string }> {
  const existing = await getArticleById(id);
  if (!existing) throw new Error("Article not found");
  const newSlug = `${existing.slug}-copy-${Date.now().toString().slice(-5)}`;
  return saveArticle(
    {
      titleBn: existing.titleBn,
      title: existing.title,
      excerpt: existing.excerpt,
      body: existing.body,
      category: existing.category,
      categoryColor: existing.categoryColor,
      tags: existing.tags,
      featured: existing.featured,
      breaking: existing.breaking,
      trending: existing.trending,
      editorPick: existing.editorPick,
      coverImage: existing.coverImage,
      images: existing.images,
      author: existing.author,
      authorNameBn: existing.authorNameBn,
      authorRole: existing.authorRole,
      authorAvatar: existing.authorAvatar,
      location: existing.location,
      seoTitle: existing.seoTitle,
      seoDescription: existing.seoDescription,
      slug: newSlug,
      status: existing.status as ArticleStatus,
      publishedAt: existing.publishedAt,
    },
    newSlug,
  );
}

export async function seedSampleArticles(): Promise<number> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const batch = writeBatch(db);
  seedArticles.forEach((a) => {
    const ref = doc(db, "articles", a.slug);
    batch.set(ref, {
      ...a,
      status: "published",
      createdAt: a.publishedAt,
    });
  });
  await batch.commit();
  return seedArticles.length;
}

const MOCK_STATS: AdminStat[] = [
  { key: "views", value: 2841936, delta: 12.4 },
  { key: "visitors", value: 412560, delta: 8.1 },
  { key: "articles", value: 2480, delta: 4.2 },
  { key: "subscribers", value: 18590, delta: -1.8 },
];

const MOCK_CHART: ChartPoint[] = [
  { label: "Mon", views: 68210, articles: 62 },
  { label: "Tue", views: 74930, articles: 71 },
  { label: "Wed", views: 61480, articles: 58 },
  { label: "Thu", views: 82450, articles: 79 },
  { label: "Fri", views: 93880, articles: 84 },
  { label: "Sat", views: 101420, articles: 92 },
  { label: "Sun", views: 88660, articles: 77 },
];

export const adminService = {
  async getStats(): Promise<AdminStat[]> {
    const db = getFirebaseDb();
    if (!db) return MOCK_STATS;
    try {
      const snap = await getDocs(collection(db, "articles"));
      const published = snap.docs.filter((d) => (d.data().status ?? "published") === "published");
      const views = published.reduce((sum, d) => sum + Number(d.data().views ?? 0), 0);
      return [
        { key: "views", value: views || snap.size * 1200, delta: 12.4 },
        { key: "articles", value: published.length, delta: 4.2 },
        { key: "visitors", value: Math.round((views || snap.size * 1200) / 6.9), delta: 8.1 },
        { key: "subscribers", value: 18590, delta: -1.8 },
      ];
    } catch {
      return MOCK_STATS;
    }
  },

  async getChart(): Promise<ChartPoint[]> {
    const db = getFirebaseDb();
    if (!db) return MOCK_CHART;
    try {
      const snap = await getDocs(collection(db, "articles"));
      const published = snap.docs.filter((d) => (d.data().status ?? "published") === "published");
      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const now = new Date();
      const counts = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const articlesInDay = published.filter((doc) => {
          const ts = new Date((doc.data().publishedAt as string) ?? "");
          return !Number.isNaN(ts.getTime()) && ts >= d && ts < next;
        });
        return {
          label: dayLabels[d.getDay()]!,
          views: articlesInDay.reduce((sum, doc) => sum + Number(doc.data().views ?? 0), 0) || articlesInDay.length * 1200,
          articles: articlesInDay.length,
        };
      });
      return counts;
    } catch {
      return MOCK_CHART;
    }
  },
};
