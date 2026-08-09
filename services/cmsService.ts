import { getSupabase } from "@/lib/supabase/client";
import { slugify } from "@/services/newsService";

export type UserRole = "Admin" | "Editor" | "Journalist" | "Subscriber";
export type UserStatus = "active" | "banned" | "pending";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  posts: number;
}

export interface AdminCategoryRow {
  id: string;
  slug: string;
  nameBn: string;
  name: string;
  color: string;
  articles: number;
  status: "active" | "inactive";
  menu: boolean;
  featured: boolean;
}

export interface AdminTagRow {
  id: string;
  name: string;
  slug: string;
  articles: number;
  views: number;
  trending: boolean;
}

export interface AdminAuthorRow {
  id: string;
  slug: string;
  nameBn: string;
  name: string;
  role: string;
  avatar: string;
  followers: number;
  articlesCount: number;
  verified: boolean;
  active: boolean;
}

export interface AdminAdRow {
  id: string;
  name: string;
  position: string;
  size: string;
  type: "banner" | "sidebar" | "inline" | "native";
  impressions: number;
  clicks: number;
  ctr: number;
  status: "active" | "inactive";
}

export interface AdminCommentRow {
  id: string;
  articleId: string;
  article: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  status: "published" | "pending" | "spam";
}

export interface AdminSubscriberRow {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: "active" | "inactive";
  source: string;
}

export interface AdminRoleRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  users: number;
  permissions: string[];
  system: boolean;
}

export interface AdminNewsletterRow {
  id: string;
  subjectBn: string;
  subjectEn: string;
  body: string;
  sentAt: string;
  opens: number;
  clicks: number;
  recipients: number;
  status: "sent" | "scheduled" | "draft";
}

function nowIso(): string {
  return new Date().toISOString();
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bool(v: unknown): boolean {
  return Boolean(v);
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function dateStr(v: unknown, fallback = ""): string {
  const s = str(v);
  if (s) return s;
  return fallback;
}

function startPolling<T>(fetcher: () => Promise<T[]>, listener: (rows: T[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    try {
      const rows = await fetcher();
      if (!stopped) listener(rows);
    } catch (err) {
      console.error("Supabase polling error:", err);
    }
  };
  void run();
  const timer = window.setInterval(() => void run(), 10000);
  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

export async function listArticles(): Promise<{ id: string; slug: string; titleBn: string; category: string; tags: string[]; author: string; publishedAt: string; status: string }[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("articles").select("id,slug,title_bn,category,tags,author,published_at,status").order("updated_at", { ascending: false });
    return (data ?? []).map((r) => ({
      id: str(r.slug, str(r.id)),
      slug: str(r.slug, str(r.id)),
      titleBn: str(r.title_bn),
      category: str(r.category, "bangladesh"),
      tags: strArr(r.tags),
      author: str(r.author, ""),
      publishedAt: dateStr(r.published_at, nowIso()),
      status: str(r.status, "published"),
    }));
  } catch (err) {
    console.error("Supabase articles read failed:", err);
    return [];
  }
}

// ---------------------------------------------------------------- Categories

export async function listCategories(): Promise<AdminCategoryRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const [{ data: rows }, articles] = await Promise.all([
      supabase.from("categories").select("*").order("name_bn"),
      listArticles(),
    ]);
    const counts = new Map<string, number>();
    articles.forEach((a) => counts.set(a.category, (counts.get(a.category) ?? 0) + 1));
    return (rows ?? []).map((d) => {
      const slug = str(d.slug, str(d.id));
      return {
        id: str(d.id),
        slug,
        nameBn: str(d.name_bn),
        name: str(d.name),
        color: str(d.color, "#E50914"),
        articles: counts.get(slug) ?? num(d.articles),
        status: (d.status as AdminCategoryRow["status"]) ?? "active",
        menu: bool(d.menu),
        featured: bool(d.featured),
      };
    });
  } catch (err) {
    console.error("Supabase categories read failed:", err);
    return [];
  }
}

export function subscribeCategories(listener: (rows: AdminCategoryRow[]) => void): () => void {
  return startPolling(listCategories, listener);
}

export async function saveCategory(id: string, input: { slug: string; nameBn: string; name: string; color: string; status: "active" | "inactive"; menu: boolean; featured: boolean }): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const slug = slugify(input.slug) || slugify(input.name);
  const { error } = await supabase.from("categories").upsert(
    { slug, name_bn: input.nameBn, name: input.name, color: input.color, status: input.status, menu: input.menu, featured: input.featured, updated_at: nowIso() },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("categories").delete().eq("id", id);
}

// ---------------------------------------------------------------- Tags

export async function listTags(): Promise<AdminTagRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const [{ data: rows }, articles] = await Promise.all([
      supabase.from("tags").select("*").order("name"),
      listArticles(),
    ]);
    const counts = new Map<string, number>();
    articles.forEach((a) => {
      a.tags.forEach((t) => {
        const key = slugify(t);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    return (rows ?? []).map((d) => {
      const slug = str(d.slug, str(d.id));
      return {
        id: str(d.id),
        name: str(d.name),
        slug,
        articles: counts.get(slug) ?? num(d.articles),
        views: num(d.views),
        trending: bool(d.trending),
      };
    });
  } catch (err) {
    console.error("Supabase tags read failed:", err);
    return [];
  }
}

export function subscribeTags(listener: (rows: AdminTagRow[]) => void): () => void {
  return startPolling(listTags, listener);
}

export async function saveTag(id: string, input: { name: string; trending: boolean }): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const slug = slugify(input.name);
  const { error } = await supabase.from("tags").upsert(
    { slug, name: input.name, trending: input.trending, updated_at: nowIso() },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("tags").delete().eq("id", id);
}

// ---------------------------------------------------------------- Authors

export async function listAuthors(): Promise<AdminAuthorRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const [{ data: rows }, articles] = await Promise.all([
      supabase.from("authors").select("*").order("name_bn"),
      listArticles(),
    ]);
    const byAuthorSlug = new Map<string, number>();
    articles.forEach((a) => {
      const key = slugify(a.author);
      if (key) byAuthorSlug.set(key, (byAuthorSlug.get(key) ?? 0) + 1);
    });
    return (rows ?? []).map((d) => {
      const slug = str(d.slug, str(d.id));
      return {
        id: str(d.id),
        slug,
        nameBn: str(d.name_bn),
        name: str(d.name),
        role: str(d.role),
        avatar: str(d.avatar),
        followers: num(d.followers),
        articlesCount: byAuthorSlug.get(slug) ?? num(d.articles_count),
        verified: bool(d.verified),
        active: bool(d.active),
      };
    });
  } catch (err) {
    console.error("Supabase authors read failed:", err);
    return [];
  }
}

export function subscribeAuthors(listener: (rows: AdminAuthorRow[]) => void): () => void {
  return startPolling(listAuthors, listener);
}

export async function saveAuthor(id: string, input: { slug: string; nameBn: string; name: string; role: string; avatar: string; followers: number; verified: boolean; active: boolean }): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const slug = slugify(input.slug) || slugify(input.name);
  const { error } = await supabase.from("authors").upsert(
    { slug, name_bn: input.nameBn, name: input.name, role: input.role, avatar: input.avatar, followers: input.followers, verified: input.verified, active: input.active, updated_at: nowIso() },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

export async function deleteAuthor(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("authors").delete().eq("id", id);
}

// ---------------------------------------------------------------- Users (profiles)

export async function listUsers(): Promise<AdminUserRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("profiles").select("*").order("joined_at", { ascending: false });
    return (data ?? []).map((d) => ({
      id: str(d.id),
      name: str(d.name, str(d.email)),
      email: str(d.email, str(d.id)),
      avatar: str(d.avatar),
      role: (d.role as UserRole) ?? "Subscriber",
      status: (d.status as UserStatus) ?? "active",
      joinedAt: dateStr(d.joined_at, nowIso()),
      lastActive: dateStr(d.last_active),
      posts: num(d.posts),
    }));
  } catch (err) {
    console.error("Supabase users read failed:", err);
    return [];
  }
}

export function subscribeUsers(listener: (rows: AdminUserRow[]) => void): () => void {
  return startPolling(listUsers, listener);
}

export async function saveUser(id: string, input: { name: string; email: string; avatar?: string; role: UserRole; status: UserStatus }): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("profiles").insert({
    email: input.email.toLowerCase(),
    name: input.name,
    avatar: input.avatar ?? "",
    role: input.role,
    status: input.status,
    joined_at: nowIso(),
    updated_at: nowIso(),
  });
  if (error) throw error;
}

export async function updateUser(id: string, patch: Partial<AdminUserRow>): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload: Record<string, unknown> = { ...patch, updated_at: nowIso() };
  delete payload.id;
  delete payload.email;
  delete payload.joinedAt;
  delete payload.lastActive;
  delete payload.posts;
  if (payload.role === undefined) delete payload.role;
  const { error } = await supabase.from("profiles").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("profiles").delete().eq("id", id);
}

// ---------------------------------------------------------------- Ads

export async function listAds(): Promise<AdminAdRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("ads").select("*").order("name");
    return (data ?? []).map((d) => ({
      id: str(d.id),
      name: str(d.name),
      position: str(d.position),
      size: str(d.size),
      type: (d.type as AdminAdRow["type"]) ?? "banner",
      impressions: num(d.impressions),
      clicks: num(d.clicks),
      ctr: num(d.ctr),
      status: (d.status as AdminAdRow["status"]) ?? "inactive",
    }));
  } catch (err) {
    console.error("Supabase ads read failed:", err);
    return [];
  }
}

export function subscribeAds(listener: (rows: AdminAdRow[]) => void): () => void {
  return startPolling(listAds, listener);
}

export async function saveAd(id: string, input: Omit<AdminAdRow, "id">): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("ads").upsert(
    { name: input.name, position: input.position, size: input.size, type: input.type, impressions: input.impressions, clicks: input.clicks, ctr: input.ctr, status: input.status, updated_at: nowIso() },
    { onConflict: "name" },
  );
  if (error) throw error;
}

export async function deleteAd(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("ads").delete().eq("id", id);
}

// ---------------------------------------------------------------- Comments

export async function listComments(): Promise<AdminCommentRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data: comments } = await supabase.from("comments").select("*").order("created_at", { ascending: false });
    const rows = comments ?? [];
    const articleIds = [...new Set(rows.map((r) => str(r.article_id)))];
    const titles = new Map<string, string>();
    if (articleIds.length > 0) {
      const { data: articles } = await supabase.from("articles").select("slug,title_bn,title").in("slug", articleIds);
      (articles ?? []).forEach((d) => titles.set(str(d.slug), str(d.title_bn, str(d.title))));
    }
    return rows.map((d) => {
      const articleId = str(d.article_id, "");
      return {
        id: str(d.id),
        articleId,
        article: titles.get(articleId) ?? str(d.article_title, articleId),
        author: str(d.author, "Anonymous"),
        avatar: str(d.avatar),
        content: str(d.content),
        createdAt: dateStr(d.created_at, nowIso()),
        likes: num(d.likes),
        status: (d.status as AdminCommentRow["status"]) ?? "published",
      };
    });
  } catch (err) {
    console.error("Supabase comments read failed:", err);
    return [];
  }
}

export function subscribeCommentsAdmin(listener: (rows: AdminCommentRow[]) => void): () => void {
  return startPolling(listComments, listener);
}

export async function updateComment(id: string, patch: Partial<AdminCommentRow>): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload: Record<string, unknown> = { ...patch, updated_at: nowIso() };
  delete payload.id;
  delete payload.articleId;
  delete payload.article;
  const { error } = await supabase.from("comments").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("comments").delete().eq("id", id);
}

// ---------------------------------------------------------------- Subscribers

export async function listSubscribers(): Promise<AdminSubscriberRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("subscribers").select("*").order("subscribed_at", { ascending: false });
    return (data ?? []).map((d) => ({
      id: str(d.id),
      email: str(d.email, str(d.id)),
      name: str(d.name),
      subscribedAt: dateStr(d.subscribed_at, nowIso()),
      status: (d.status as AdminSubscriberRow["status"]) ?? "active",
      source: str(d.source, "Website form"),
    }));
  } catch (err) {
    console.error("Supabase subscribers read failed:", err);
    return [];
  }
}

export function subscribeSubscribers(listener: (rows: AdminSubscriberRow[]) => void): () => void {
  return startPolling(listSubscribers, listener);
}

export async function addSubscriber(email: string, source = "Website form", name = ""): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const clean = email.trim().toLowerCase();
  const { error } = await supabase
    .from("subscribers")
    .upsert({ email: clean, name, source, status: "active", subscribed_at: nowIso() }, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    console.error("Failed to add subscriber:", error);
    throw error;
  }
}

export async function deleteSubscriber(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("subscribers").delete().eq("id", id);
}

// ---------------------------------------------------------------- Roles

export const DEFAULT_ROLES: Omit<AdminRoleRow, "id" | "users">[] = [
  { slug: "admin", name: "Administrator", description: "Full access to everything", permissions: ["*"], system: true },
  { slug: "editor", name: "Editor", description: "Manage content, approve comments", permissions: ["news:write", "news:publish", "comments:moderate", "media:manage"], system: true },
  { slug: "journalist", name: "Journalist", description: "Write and submit articles", permissions: ["news:write", "media:upload"], system: true },
  { slug: "subscriber", name: "Subscriber", description: "Read articles and comment", permissions: ["read", "comment"], system: true },
];

export async function listRoles(): Promise<AdminRoleRow[]> {
  const supabase = getSupabase();
  if (!supabase) return DEFAULT_ROLES.map((r) => ({ ...r, id: r.slug, users: 0 }));
  try {
    const { data } = await supabase.from("roles").select("*").order("name");
    const rows = (data ?? []).map((d) => ({
      id: str(d.id),
      slug: str(d.slug, str(d.id)),
      name: str(d.name),
      description: str(d.description),
      users: num(d.users),
      permissions: strArr(d.permissions),
      system: bool(d.system),
    }));
    if (rows.length === 0) return DEFAULT_ROLES.map((r) => ({ ...r, id: r.slug, users: 0 }));
    return rows;
  } catch (err) {
    console.error("Supabase roles read failed:", err);
    return DEFAULT_ROLES.map((r) => ({ ...r, id: r.slug, users: 0 }));
  }
}

export function subscribeRoles(listener: (rows: AdminRoleRow[]) => void): () => void {
  return startPolling(listRoles, listener);
}

export async function saveRole(id: string, input: { slug: string; name: string; description: string; permissions: string[]; system: boolean }): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const slug = slugify(input.slug) || slugify(input.name);
  const { error } = await supabase.from("roles").upsert(
    { slug, name: input.name, description: input.description, permissions: input.permissions, system: input.system, updated_at: nowIso() },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

export async function deleteRole(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("roles").delete().eq("id", id);
}

// ---------------------------------------------------------------- Newsletters

export async function listNewsletters(): Promise<AdminNewsletterRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("newsletters").select("*").order("sent_at", { ascending: false });
    return (data ?? []).map((d) => ({
      id: str(d.id),
      subjectBn: str(d.subject_bn),
      subjectEn: str(d.subject_en),
      body: str(d.body),
      sentAt: dateStr(d.sent_at),
      opens: num(d.opens),
      clicks: num(d.clicks),
      recipients: num(d.recipients),
      status: (d.status as AdminNewsletterRow["status"]) ?? "draft",
    }));
  } catch (err) {
    console.error("Supabase newsletters read failed:", err);
    return [];
  }
}

export function subscribeNewsletters(listener: (rows: AdminNewsletterRow[]) => void): () => void {
  return startPolling(listNewsletters, listener);
}

export async function saveNewsletter(id: string, input: Partial<AdminNewsletterRow>): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const payload: Record<string, unknown> = {
    subject_bn: input.subjectBn,
    subject_en: input.subjectEn,
    body: input.body,
    sent_at: input.sentAt,
    opens: input.opens,
    clicks: input.clicks,
    recipients: input.recipients,
    status: input.status,
    updated_at: nowIso(),
  };
  const { error } = await supabase.from("newsletters").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteNewsletter(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("newsletters").delete().eq("id", id);
}

// ---------------------------------------------------------------- Helper

export function uniqueId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
