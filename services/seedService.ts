import { getSupabase } from "@/lib/supabase/client";
import { categories } from "@/constants/categories";
import { articles as seedArticleList } from "@/data/articles";
import { authors as seedAuthorList } from "@/data/authors";
import { ADMIN_ACCOUNTS } from "@/services/authService";
import { DEFAULT_ROLES, type AdminRoleRow } from "@/services/cmsService";
import { slugify } from "@/services/newsService";

const VERSION = 1;

async function isEmpty(table: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return (count ?? 0) === 0;
}

async function seedCategories(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const rows = categories.map((c, i) => ({
    slug: c.slug,
    name: c.name,
    name_bn: c.nameBn,
    color: c.color,
    status: "active",
    menu: i < 8,
    featured: ["bangladesh", "international", "sports"].includes(c.slug),
  }));
  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
}

async function seedRoles(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const rows = DEFAULT_ROLES.map((r: Omit<AdminRoleRow, "id" | "users">) => ({
    slug: r.slug,
    name: r.name,
    description: r.description,
    permissions: r.permissions,
    system: r.system,
    users: 0,
  }));
  const { error } = await supabase.from("roles").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
}

async function seedUsers(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const now = new Date().toISOString();
  const rows = ADMIN_ACCOUNTS.map(({ email, uid }) => ({
    id: uid,
    email,
    name: email.split("@")[0] ?? email,
    avatar: "",
    role: "Admin",
    status: "active",
    joined_at: now,
    last_active: now,
    posts: 0,
  }));
  const { error } = await supabase.from("profiles").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}

async function seedAuthors(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const rows = seedAuthorList.map((a) => ({
    slug: a.slug,
    name: a.name,
    name_bn: a.nameBn,
    role: a.role,
    email: a.email,
    bio: a.bio,
    avatar: a.avatar,
    cover: a.cover,
    followers: a.followers,
    articles_count: a.articlesCount,
    verified: a.verified,
    active: true,
    social: a.social,
  }));
  const { error } = await supabase.from("authors").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
}

async function seedArticles(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const rows = seedArticleList.map((a) => ({
    slug: a.slug,
    title: a.title,
    title_bn: a.titleBn,
    excerpt: a.excerpt,
    body: a.body,
    category: a.category,
    category_color: a.categoryColor,
    tags: a.tags,
    author: a.author,
    author_name_bn: a.authorNameBn ?? "",
    author_slug: a.authorSlug ?? slugify(a.author),
    author_avatar: a.authorAvatar ?? "",
    author_role: a.authorRole ?? "Reporter",
    cover_image: a.coverImage,
    images: a.images,
    published_at: a.publishedAt,
    updated_at: a.updatedAt,
    views: a.views,
    likes: a.likes,
    comments_count: a.commentsCount,
    reading_minutes: a.readingMinutes,
    featured: a.featured,
    breaking: a.breaking,
    trending: a.trending,
    editor_pick: a.editorPick,
    is_video: a.isVideo ?? false,
    is_gallery: a.isGallery ?? false,
    video_url: a.videoUrl ?? null,
    location: a.location ?? "",
    seo_title: a.seoTitle ?? "",
    seo_description: a.seoDescription ?? "",
    status: "published",
  }));
  const { error } = await supabase.from("articles").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
}

async function seedTags(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const tagMap = new Map<string, string>();
  seedArticleList.forEach((a) => {
    a.tags.forEach((t) => tagMap.set(slugify(t), t));
  });
  if (tagMap.size === 0) return;
  const rows = [...tagMap.entries()].map(([slug, name]) => ({ slug, name, trending: false, views: 0 }));
  const { error } = await supabase.from("tags").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
}

export async function ensureInitialData(): Promise<{ initialized: boolean; seeded: string[] }> {
  const supabase = getSupabase();
  if (!supabase) return { initialized: false, seeded: [] };
  const seeded: string[] = [];
  try {
    const checks: Array<[string, () => Promise<void>]> = [
      ["categories", seedCategories],
      ["roles", seedRoles],
      ["profiles", seedUsers],
      ["authors", seedAuthors],
      ["articles", seedArticles],
      ["tags", seedTags],
    ];
    for (const [table, fn] of checks) {
      try {
        if (await isEmpty(table)) {
          await fn();
          seeded.push(table);
        }
      } catch (err) {
        console.error(`Failed to seed ${table}:`, err);
      }
    }
    try {
      const { data: meta } = await supabase.from("meta").select("key").eq("key", "init").limit(1).maybeSingle();
      if (!meta) {
        await supabase.from("meta").upsert({ key: "init", value: { initializedAt: new Date().toISOString(), version: VERSION } }, { onConflict: "key" });
      }
    } catch (err) {
      console.error("Failed to write meta init:", err);
    }
    return { initialized: true, seeded };
  } catch (err) {
    console.error("Failed to initialize Supabase data:", err);
    return { initialized: false, seeded };
  }
}
