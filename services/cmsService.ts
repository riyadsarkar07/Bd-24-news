import { getFirebaseDb } from "@/lib/firebase/client";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
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

export async function listArticles(): Promise<{ id: string; slug: string; titleBn: string; category: string; tags: string[]; publishedAt: string; status: string }[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, "articles"));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        slug: str(data.slug, d.id),
        titleBn: str(data.titleBn),
        category: str(data.category, "bangladesh"),
        tags: strArr(data.tags),
        publishedAt: dateStr(data.publishedAt, nowIso()),
        status: str(data.status, "published"),
      };
    });
  } catch (err) {
    console.error("Firestore articles read failed:", err);
    return [];
  }
}

// ---------------------------------------------------------------- Categories

export async function listCategories(): Promise<AdminCategoryRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const [catSnap, articles] = await Promise.all([getDocs(collection(db, "categories")), listArticles()]);
    const counts = new Map<string, number>();
    articles.forEach((a) => counts.set(a.category, (counts.get(a.category) ?? 0) + 1));
    return catSnap.docs.map((d) => {
      const data = d.data();
      const slug = str(data.slug, d.id);
      return {
        id: d.id,
        slug,
        nameBn: str(data.nameBn),
        name: str(data.name),
        color: str(data.color, "#E50914"),
        articles: counts.get(slug) ?? num(data.articles),
        status: (data.status as AdminCategoryRow["status"]) ?? "active",
        menu: bool(data.menu),
        featured: bool(data.featured),
      };
    });
  } catch (err) {
    console.error("Firestore categories read failed:", err);
    return [];
  }
}

export function subscribeCategories(listener: (rows: AdminCategoryRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "categories"), orderBy("nameBn")),
    async (snap) => {
      const articles = await listArticles();
      const counts = new Map<string, number>();
      articles.forEach((a) => counts.set(a.category, (counts.get(a.category) ?? 0) + 1));
      listener(snap.docs.map((d) => {
        const data = d.data();
        const slug = str(data.slug, d.id);
        return {
          id: d.id,
          slug,
          nameBn: str(data.nameBn),
          name: str(data.name),
          color: str(data.color, "#E50914"),
          articles: counts.get(slug) ?? num(data.articles),
          status: (data.status as AdminCategoryRow["status"]) ?? "active",
          menu: bool(data.menu),
          featured: bool(data.featured),
        };
      }));
    },
    (err) => console.error("Firestore categories snapshot error:", err),
  );
}

export async function saveCategory(id: string, input: { slug: string; nameBn: string; name: string; color: string; status: "active" | "inactive"; menu: boolean; featured: boolean }): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const slug = slugify(input.slug) || slugify(input.name);
  await setDoc(doc(db, "categories", slug), { ...input, slug, updatedAt: nowIso() }, { merge: true });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "categories", id));
}

// ---------------------------------------------------------------- Tags

export async function listTags(): Promise<AdminTagRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const [tagSnap, articles] = await Promise.all([getDocs(collection(db, "tags")), listArticles()]);
    const counts = new Map<string, number>();
    articles.forEach((a) => {
      a.tags.forEach((t) => {
        const key = slugify(t);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    return tagSnap.docs.map((d) => {
      const data = d.data();
      const slug = str(data.slug, d.id);
      return {
        id: d.id,
        name: str(data.name),
        slug,
        articles: counts.get(slug) ?? num(data.articles),
        views: num(data.views),
        trending: bool(data.trending),
      };
    });
  } catch (err) {
    console.error("Firestore tags read failed:", err);
    return [];
  }
}

export function subscribeTags(listener: (rows: AdminTagRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "tags"), orderBy("name")),
    async (snap) => {
      const articles = await listArticles();
      const counts = new Map<string, number>();
      articles.forEach((a) => a.tags.forEach((t) => counts.set(slugify(t), (counts.get(slugify(t)) ?? 0) + 1)));
      listener(snap.docs.map((d) => {
        const data = d.data();
        const slug = str(data.slug, d.id);
        return {
          id: d.id,
          name: str(data.name),
          slug,
          articles: counts.get(slug) ?? num(data.articles),
          views: num(data.views),
          trending: bool(data.trending),
        };
      }));
    },
    (err) => console.error("Firestore tags snapshot error:", err),
  );
}

export async function saveTag(id: string, input: { name: string; trending: boolean }): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const slug = slugify(input.name);
  await setDoc(doc(db, "tags", slug), { ...input, slug, updatedAt: nowIso() }, { merge: true });
}

export async function deleteTag(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "tags", id));
}

// ---------------------------------------------------------------- Authors

export async function listAuthors(): Promise<AdminAuthorRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const [authSnap, articles] = await Promise.all([getDocs(collection(db, "authors")), listArticles()]);
    const byAuthorSlug = new Map<string, number>();
    articles.forEach((a) => {
      const key = slugify(str((a as { author?: string }).author, ""));
      if (key) byAuthorSlug.set(key, (byAuthorSlug.get(key) ?? 0) + 1);
    });
    return authSnap.docs.map((d) => {
      const data = d.data();
      const slug = str(data.slug, d.id);
      return {
        id: d.id,
        slug,
        nameBn: str(data.nameBn),
        name: str(data.name),
        role: str(data.role),
        avatar: str(data.avatar),
        followers: num(data.followers),
        articlesCount: byAuthorSlug.get(slug) ?? num(data.articlesCount),
        verified: bool(data.verified),
        active: bool(data.active),
      };
    });
  } catch (err) {
    console.error("Firestore authors read failed:", err);
    return [];
  }
}

export function subscribeAuthors(listener: (rows: AdminAuthorRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "authors"), orderBy("nameBn")),
    async (snap) => {
      const articles = await listArticles();
      const byAuthorSlug = new Map<string, number>();
      articles.forEach((a) => {
        const key = slugify(str((a as { author?: string }).author, ""));
        if (key) byAuthorSlug.set(key, (byAuthorSlug.get(key) ?? 0) + 1);
      });
      listener(snap.docs.map((d) => {
        const data = d.data();
        const slug = str(data.slug, d.id);
        return {
          id: d.id,
          slug,
          nameBn: str(data.nameBn),
          name: str(data.name),
          role: str(data.role),
          avatar: str(data.avatar),
          followers: num(data.followers),
          articlesCount: byAuthorSlug.get(slug) ?? num(data.articlesCount),
          verified: bool(data.verified),
          active: bool(data.active),
        };
      }));
    },
    (err) => console.error("Firestore authors snapshot error:", err),
  );
}

export async function saveAuthor(id: string, input: { slug: string; nameBn: string; name: string; role: string; avatar: string; followers: number; verified: boolean; active: boolean }): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const slug = slugify(input.slug) || slugify(input.name);
  await setDoc(doc(db, "authors", slug), { ...input, slug, updatedAt: nowIso() }, { merge: true });
}

export async function deleteAuthor(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "authors", id));
}

// ---------------------------------------------------------------- Users

export async function listUsers(): Promise<AdminUserRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "users"), orderBy("joinedAt", "desc")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: str(data.name, str(data.email)),
        email: str(data.email, d.id),
        avatar: str(data.avatar),
        role: (data.role as UserRole) ?? "Subscriber",
        status: (data.status as UserStatus) ?? "active",
        joinedAt: dateStr(data.joinedAt, nowIso()),
        lastActive: dateStr(data.lastActive),
        posts: num(data.posts),
      };
    });
  } catch (err) {
    console.error("Firestore users read failed:", err);
    return [];
  }
}

export function subscribeUsers(listener: (rows: AdminUserRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "users"), orderBy("joinedAt", "desc")),
    (snap) => {
      listener(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: str(data.name, str(data.email)),
          email: str(data.email, d.id),
          avatar: str(data.avatar),
          role: (data.role as UserRole) ?? "Subscriber",
          status: (data.status as UserStatus) ?? "active",
          joinedAt: dateStr(data.joinedAt, nowIso()),
          lastActive: dateStr(data.lastActive),
          posts: num(data.posts),
        };
      }));
    },
    (err) => console.error("Firestore users snapshot error:", err),
  );
}

export async function saveUser(id: string, input: { name: string; email: string; avatar?: string; role: UserRole; status: UserStatus }): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const key = slugify(input.email) || id;
  await setDoc(doc(db, "users", key), { ...input, updatedAt: nowIso() }, { merge: true });
}

export async function updateUser(id: string, patch: Partial<AdminUserRow>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  await setDoc(doc(db, "users", id), { ...patch, updatedAt: nowIso() }, { merge: true });
}

export async function deleteUser(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "users", id));
}

// ---------------------------------------------------------------- Ads

export async function listAds(): Promise<AdminAdRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "ads"), orderBy("name")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: str(data.name),
        position: str(data.position),
        size: str(data.size),
        type: (data.type as AdminAdRow["type"]) ?? "banner",
        impressions: num(data.impressions),
        clicks: num(data.clicks),
        ctr: num(data.ctr),
        status: (data.status as AdminAdRow["status"]) ?? "inactive",
      };
    });
  } catch (err) {
    console.error("Firestore ads read failed:", err);
    return [];
  }
}

export function subscribeAds(listener: (rows: AdminAdRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "ads"), orderBy("name")),
    (snap) => listener(snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: str(data.name),
        position: str(data.position),
        size: str(data.size),
        type: (data.type as AdminAdRow["type"]) ?? "banner",
        impressions: num(data.impressions),
        clicks: num(data.clicks),
        ctr: num(data.ctr),
        status: (data.status as AdminAdRow["status"]) ?? "inactive",
      };
    })),
    (err) => console.error("Firestore ads snapshot error:", err),
  );
}

export async function saveAd(id: string, input: Omit<AdminAdRow, "id">): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  await setDoc(doc(db, "ads", id), { ...input, updatedAt: nowIso() }, { merge: true });
}

export async function deleteAd(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "ads", id));
}

// ---------------------------------------------------------------- Comments

export async function listComments(): Promise<AdminCommentRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const [commentSnap, articleSnap] = await Promise.all([getDocs(collection(db, "comments")), getDocs(collection(db, "articles"))]);
    const titles = new Map<string, string>();
    articleSnap.docs.forEach((d) => titles.set(d.id, str(d.data().titleBn, str(d.data().title, d.id))));
    return commentSnap.docs.map((d) => {
      const data = d.data();
      const articleId = str(data.articleId, "");
      return {
        id: d.id,
        articleId,
        article: titles.get(articleId) ?? str(data.articleTitle, articleId),
        author: str(data.author, "Anonymous"),
        avatar: str(data.avatar),
        content: str(data.content),
        createdAt: dateStr(data.createdAt, nowIso()),
        likes: num(data.likes),
        status: (data.status as AdminCommentRow["status"]) ?? "published",
      };
    });
  } catch (err) {
    console.error("Firestore comments read failed:", err);
    return [];
  }
}

export function subscribeCommentsAdmin(listener: (rows: AdminCommentRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "comments"), orderBy("createdAt", "desc")),
    async (snap) => {
      const titles = new Map<string, string>();
      try {
        const articleSnap = await getDocs(collection(db, "articles"));
        articleSnap.docs.forEach((d) => titles.set(d.id, str(d.data().titleBn, str(d.data().title, d.id))));
      } catch {
        /* ignore */
      }
      listener(snap.docs.map((d) => {
        const data = d.data();
        const articleId = str(data.articleId, "");
        return {
          id: d.id,
          articleId,
          article: titles.get(articleId) ?? str(data.articleTitle, articleId),
          author: str(data.author, "Anonymous"),
          avatar: str(data.avatar),
          content: str(data.content),
          createdAt: dateStr(data.createdAt, nowIso()),
          likes: num(data.likes),
          status: (data.status as AdminCommentRow["status"]) ?? "published",
        };
      }));
    },
    (err) => console.error("Firestore comments snapshot error:", err),
  );
}

export async function updateComment(id: string, patch: Partial<AdminCommentRow>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  await setDoc(doc(db, "comments", id), { ...patch, updatedAt: nowIso() }, { merge: true });
}

export async function deleteComment(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "comments", id));
}

// ---------------------------------------------------------------- Subscribers

export async function listSubscribers(): Promise<AdminSubscriberRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "subscribers"), orderBy("subscribedAt", "desc")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        email: str(data.email, d.id),
        name: str(data.name),
        subscribedAt: dateStr(data.subscribedAt, nowIso()),
        status: (data.status as AdminSubscriberRow["status"]) ?? "active",
        source: str(data.source, "Website form"),
      };
    });
  } catch (err) {
    console.error("Firestore subscribers read failed:", err);
    return [];
  }
}

export function subscribeSubscribers(listener: (rows: AdminSubscriberRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "subscribers"), orderBy("subscribedAt", "desc")),
    (snap) => listener(snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        email: str(data.email, d.id),
        name: str(data.name),
        subscribedAt: dateStr(data.subscribedAt, nowIso()),
        status: (data.status as AdminSubscriberRow["status"]) ?? "active",
        source: str(data.source, "Website form"),
      };
    })),
    (err) => console.error("Firestore subscribers snapshot error:", err),
  );
}

export async function addSubscriber(email: string, source = "Website form", name = ""): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const clean = email.trim().toLowerCase();
  await setDoc(
    doc(db, "subscribers", slugify(clean)),
    { email: clean, name, source, status: "active", subscribedAt: nowIso() },
    { merge: true },
  );
}

export async function deleteSubscriber(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "subscribers", id));
}

// ---------------------------------------------------------------- Roles

export const DEFAULT_ROLES: Omit<AdminRoleRow, "id" | "users">[] = [
  { slug: "admin", name: "Administrator", description: "Full access to everything", permissions: ["*"], system: true },
  { slug: "editor", name: "Editor", description: "Manage content, approve comments", permissions: ["news:write", "news:publish", "comments:moderate", "media:manage"], system: true },
  { slug: "journalist", name: "Journalist", description: "Write and submit articles", permissions: ["news:write", "media:upload"], system: true },
  { slug: "subscriber", name: "Subscriber", description: "Read articles and comment", permissions: ["read", "comment"], system: true },
];

export async function listRoles(): Promise<AdminRoleRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "roles"), orderBy("name")));
    const rows = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        slug: str(data.slug, d.id),
        name: str(data.name),
        description: str(data.description),
        users: num(data.users),
        permissions: strArr(data.permissions),
        system: bool(data.system),
      };
    });
    if (rows.length === 0) return DEFAULT_ROLES.map((r) => ({ ...r, id: r.slug, users: 0 }));
    return rows;
  } catch (err) {
    console.error("Firestore roles read failed:", err);
    return DEFAULT_ROLES.map((r) => ({ ...r, id: r.slug, users: 0 }));
  }
}

export function subscribeRoles(listener: (rows: AdminRoleRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "roles"), orderBy("name")),
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          slug: str(data.slug, d.id),
          name: str(data.name),
          description: str(data.description),
          users: num(data.users),
          permissions: strArr(data.permissions),
          system: bool(data.system),
        };
      });
      if (rows.length === 0) {
        listener(DEFAULT_ROLES.map((r) => ({ ...r, id: r.slug, users: 0 })));
        return;
      }
      listener(rows);
    },
    (err) => console.error("Firestore roles snapshot error:", err),
  );
}

export async function saveRole(id: string, input: { slug: string; name: string; description: string; permissions: string[]; system: boolean }): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const slug = slugify(input.slug) || slugify(input.name);
  await setDoc(doc(db, "roles", slug), { ...input, slug, updatedAt: nowIso() }, { merge: true });
}

export async function deleteRole(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "roles", id));
}

// ---------------------------------------------------------------- Newsletters

export async function listNewsletters(): Promise<AdminNewsletterRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "newsletters"), orderBy("sentAt", "desc")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        subjectBn: str(data.subjectBn),
        subjectEn: str(data.subjectEn),
        body: str(data.body),
        sentAt: dateStr(data.sentAt),
        opens: num(data.opens),
        clicks: num(data.clicks),
        recipients: num(data.recipients),
        status: (data.status as AdminNewsletterRow["status"]) ?? "draft",
      };
    });
  } catch (err) {
    console.error("Firestore newsletters read failed:", err);
    return [];
  }
}

export function subscribeNewsletters(listener: (rows: AdminNewsletterRow[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  return onSnapshot(
    query(collection(db, "newsletters"), orderBy("sentAt", "desc")),
    (snap) => listener(snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        subjectBn: str(data.subjectBn),
        subjectEn: str(data.subjectEn),
        body: str(data.body),
        sentAt: dateStr(data.sentAt),
        opens: num(data.opens),
        clicks: num(data.clicks),
        recipients: num(data.recipients),
        status: (data.status as AdminNewsletterRow["status"]) ?? "draft",
      };
    })),
    (err) => console.error("Firestore newsletters snapshot error:", err),
  );
}

export async function saveNewsletter(id: string, input: Partial<AdminNewsletterRow>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  await setDoc(doc(db, "newsletters", id), { ...input, updatedAt: nowIso() }, { merge: true });
}

export async function deleteNewsletter(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "newsletters", id));
}

// ---------------------------------------------------------------- Helper

export function uniqueId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
