import { articles as seedArticles } from "@/data/articles";
import type { Article } from "@/types";
import { getSupabase } from "@/lib/supabase/client";
import { mapArticleRow, slugify } from "@/services/newsService";

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
  commentsEnabled?: boolean;
}

const DEFAULT_AUTHOR = { name: "Riyad", nameBn: "রিয়াদ", role: "Editor" };

function buildArticlePayload(input: ArticleInput, existing?: Article): Record<string, unknown> {
  const now = new Date().toISOString();
  const slug = input.slug?.trim() || slugify(input.title) || `article-${Date.now()}`;
  const category = input.category || "bangladesh";
  const categoryColor = input.categoryColor || "#E50914";
  const authorName = input.author?.trim() || DEFAULT_AUTHOR.name;
  const authorNameBn = input.authorNameBn?.trim() || DEFAULT_AUTHOR.nameBn;
  const authorRole = input.authorRole?.trim() || DEFAULT_AUTHOR.role;
  const status = input.status === "draft" ? "draft" : "published";

  // Published time rules:
  //  * an existing published article always keeps its original timestamp
  //  * an explicit editor-provided timestamp wins for scheduled/first publish
  //  * otherwise the timestamp is set the first time the article goes live
  let publishedAt: string | null;
  if (status === "draft") {
    publishedAt = existing?.publishedAt || input.publishedAt || null;
  } else if (existing?.status === "published" && existing.publishedAt) {
    publishedAt = existing.publishedAt;
  } else {
    publishedAt = input.publishedAt || now;
  }

  const body = input.body || "";
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title_bn: input.titleBn,
    title: input.title,
    excerpt: input.excerpt,
    body,
    category,
    category_color: categoryColor,
    tags: input.tags || [],
    author: authorName,
    author_name_bn: authorNameBn,
    author_slug: slugify(authorName),
    author_avatar: input.authorAvatar || "",
    author_role: authorRole,
    cover_image: input.coverImage || "",
    images: input.images && input.images.length > 0 ? input.images : input.coverImage ? [input.coverImage] : [],
    published_at: publishedAt,
    updated_at: now,
    views: existing?.views ?? 0,
    likes: existing?.likes ?? 0,
    comments_count: existing?.commentsCount ?? 0,
    reading_minutes: Math.max(1, Math.round(words / 220)),
    featured: Boolean(input.featured),
    breaking: Boolean(input.breaking),
    trending: Boolean(input.trending),
    editor_pick: Boolean(input.editorPick),
    is_video: existing?.isVideo ?? false,
    is_gallery: existing?.isGallery ?? false,
    video_url: existing?.videoUrl ?? null,
    location: input.location || "",
    seo_title: input.seoTitle || "",
    seo_description: input.seoDescription || "",
    status,
    comments_enabled: input.commentsEnabled ?? existing?.commentsEnabled ?? true,
  };
}

export async function listAllArticles(): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("articles").select("*").order("updated_at", { ascending: false });
    return (data ?? []).map((r) => {
      const article = mapArticleRow(r as Record<string, unknown>);
      article.status = (r.status as ArticleStatus) ?? "published";
      return article;
    });
  } catch (err) {
    console.error("Supabase articles read failed:", err);
    return [];
  }
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const { data } = await supabase.from("articles").select("*").eq(isUuid ? "id" : "slug", id).limit(1).maybeSingle();
    if (data) {
      const article = mapArticleRow(data as Record<string, unknown>);
      article.status = (data.status as ArticleStatus) ?? "published";
      return article;
    }
    return undefined;
  } catch (err) {
    console.error("Supabase article read failed:", err);
    return undefined;
  }
}

export async function saveArticle(input: ArticleInput, existingId?: string): Promise<{ id: string; slug: string }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.");
  const existing = existingId ? await getArticleById(existingId) : undefined;
  const payload = buildArticlePayload(input, existing);

  const upsert = (body: Record<string, unknown>) =>
    supabase.from("articles").upsert(body, { onConflict: "slug" }).select("id,slug").single();

  let { data, error } = await upsert(payload);

  // The comments_enabled column is added by an additive migration. Until it
  // has been applied, save the article without it instead of failing.
  if (error && /comments_enabled/i.test(error.message)) {
    const { comments_enabled: _drop, ...withoutFlag } = payload;
    void _drop;
    const retry = await upsert(withoutFlag);
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  return { id: str(data?.slug, str(data?.id)), slug: str(data?.slug, str(data?.id)) };
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export async function deleteArticle(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("articles").delete().or(`slug.eq.${id},id.eq.${id}`);
}

export async function deleteArticles(ids: string[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || ids.length === 0) return;
  const uuids = ids.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
  const slugs = ids.filter((id) => !uuids.includes(id));
  if (uuids.length > 0) {
    const { error } = await supabase.from("articles").delete().in("id", uuids);
    if (error) throw error;
  }
  if (slugs.length > 0) {
    const { error } = await supabase.from("articles").delete().in("slug", slugs);
    if (error) throw error;
  }
}

export async function setArticlesStatus(ids: string[], status: ArticleStatus): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || ids.length === 0) return;
  const uuids = ids.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
  const slugs = ids.filter((id) => !uuids.includes(id));
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = { status, updated_at: now };

  async function run(column: "id" | "slug", values: string[]) {
    if (values.length === 0) return;
    // Never overwrite an existing publish timestamp when re-publishing.
    if (status === "published") {
      const { error: stampError } = await supabase!
        .from("articles")
        .update({ published_at: now })
        .in(column, values)
        .is("published_at", null);
      if (stampError) throw stampError;
    }
    const { error } = await supabase!.from("articles").update(payload).in(column, values);
    if (error) throw error;
  }

  await run("id", uuids);
  await run("slug", slugs);
}

export async function setArticleCommentsEnabled(id: string, enabled: boolean): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase
    .from("articles")
    .update({ comments_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    if (/comments_enabled/i.test(error.message)) {
      throw new Error("Run the latest database migration before changing comment settings.");
    }
    throw error;
  }
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
      commentsEnabled: existing.commentsEnabled,
    },
    newSlug,
  );
}

export async function seedSampleArticles(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const rows = seedArticles.map((a) => buildArticlePayload({ ...a, status: "published", publishedAt: a.publishedAt }));
  const { error } = await supabase.from("articles").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  return seedArticles.length;
}

export const adminService = {
  async getStats(): Promise<AdminStat[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    try {
      const [articlesRes, usersRes, subscribersRes] = await Promise.all([
        supabase.from("articles").select("status,views"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscribers").select("id", { count: "exact", head: true }),
      ]);
      const all = articlesRes.data ?? [];
      const published = all.filter((d) => (d.status ?? "published") === "published");
      const views = published.reduce((sum, d) => sum + Number(d.views ?? 0), 0);
      return [
        { key: "views", value: views, delta: 0 },
        { key: "articles", value: published.length, delta: 0 },
        { key: "users", value: usersRes.count ?? 0, delta: 0 },
        { key: "subscribers", value: subscribersRes.count ?? 0, delta: 0 },
      ];
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      return [];
    }
  },

  async getChart(): Promise<ChartPoint[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    try {
      const { data } = await supabase.from("articles").select("status,views,published_at");
      const published = (data ?? []).filter((d) => (d.status ?? "published") === "published");
      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const now = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const articlesInDay = published.filter((doc) => {
          const ts = new Date(doc.published_at ?? "");
          return !Number.isNaN(ts.getTime()) && ts >= d && ts < next;
        });
        return {
          label: dayLabels[d.getDay()]!,
          views: articlesInDay.reduce((sum, doc) => sum + Number(doc.views ?? 0), 0),
          articles: articlesInDay.length,
        };
      });
    } catch (err) {
      console.error("Failed to load dashboard chart:", err);
      return [];
    }
  },
};
