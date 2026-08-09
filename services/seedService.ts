import { getFirebaseDb } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { categories } from "@/constants/categories";
import { articles as seedArticleList } from "@/data/articles";
import { authors as seedAuthorList } from "@/data/authors";
import { ADMIN_ACCOUNTS } from "@/services/authService";
import { DEFAULT_ROLES, type AdminRoleRow } from "@/services/cmsService";
import { slugify } from "@/services/newsService";

const VERSION = 1;

async function isEmpty(db: Firestore, name: string): Promise<boolean> {
  const snap = await getDocs(query(collection(db, name), limit(1)));
  return snap.empty;
}

async function seedCategories(db: Firestore): Promise<void> {
  const batch = writeBatch(db);
  categories.forEach((c, i) => {
    batch.set(doc(db, "categories", c.slug), {
      slug: c.slug,
      name: c.name,
      nameBn: c.nameBn,
      color: c.color,
      status: "active",
      menu: i < 8,
      featured: ["bangladesh", "international", "sports"].includes(c.slug),
    });
  });
  await batch.commit();
}

async function seedRoles(db: Firestore): Promise<void> {
  const batch = writeBatch(db);
  DEFAULT_ROLES.forEach((r: Omit<AdminRoleRow, "id" | "users">) => {
    batch.set(doc(db, "roles", r.slug), { ...r, users: 0 });
  });
  await batch.commit();
}

async function seedUsers(db: Firestore): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  ADMIN_ACCOUNTS.forEach(({ email, uid }) => {
    batch.set(doc(db, "users", uid), {
      uid,
      email,
      name: email.split("@")[0] ?? email,
      avatar: "",
      role: "Admin",
      status: "active",
      joinedAt: now,
      lastActive: now,
      posts: 0,
    });
  });
  await batch.commit();
}

async function seedAuthors(db: Firestore): Promise<void> {
  const batch = writeBatch(db);
  seedAuthorList.forEach((a) => {
    batch.set(doc(db, "authors", a.slug), {
      slug: a.slug,
      name: a.name,
      nameBn: a.nameBn,
      role: a.role,
      email: a.email,
      bio: a.bio,
      avatar: a.avatar,
      cover: a.cover,
      followers: a.followers,
      articlesCount: a.articlesCount,
      verified: a.verified,
      active: true,
      social: a.social,
    });
  });
  await batch.commit();
}

async function seedArticles(db: Firestore): Promise<void> {
  const batch = writeBatch(db);
  seedArticleList.forEach((a) => {
    batch.set(doc(db, "articles", a.slug), {
      ...a,
      id: a.slug,
      status: "published",
      createdAt: a.publishedAt,
      updatedAt: a.publishedAt,
    });
  });
  await batch.commit();
}

async function seedTags(db: Firestore): Promise<void> {
  const tagMap = new Map<string, string>();
  const articlesSnap = await getDocs(collection(db, "articles"));
  articlesSnap.docs.forEach((d) => {
    const tags = d.data().tags;
    if (Array.isArray(tags)) {
      tags.forEach((t: string) => {
        if (typeof t !== "string" || !t.trim()) return;
        tagMap.set(slugify(t), t);
      });
    }
  });
  const seed = seedArticleList;
  seed.forEach((a) => {
    a.tags.forEach((t) => tagMap.set(slugify(t), t));
  });
  if (tagMap.size === 0) return;
  const batch = writeBatch(db);
  tagMap.forEach((name, slug) => {
    batch.set(doc(db, "tags", slug), { slug, name, trending: false, views: 0 });
  });
  await batch.commit();
}

export async function ensureInitialData(): Promise<{ initialized: boolean; seeded: string[] }> {
  const db = getFirebaseDb();
  if (!db) return { initialized: false, seeded: [] };
  const seeded: string[] = [];
  try {
    const metaDoc = doc(db, "meta", "init");
    const metaSnap = await getDocs(query(collection(db, "meta"), limit(1)));
    const already = metaSnap.docs.some((d) => d.id === "init");
    const checks: Array<[string, (db: Firestore) => Promise<void>]> = [
      ["categories", seedCategories],
      ["roles", seedRoles],
      ["users", seedUsers],
      ["authors", seedAuthors],
      ["articles", seedArticles],
      ["tags", seedTags],
    ];
    for (const [name, fn] of checks) {
      try {
        if (await isEmpty(db, name)) {
          await fn(db);
          seeded.push(name);
        }
      } catch (err) {
        console.error(`Failed to seed ${name}:`, err);
      }
    }
    if (!already) {
      await setDoc(metaDoc, { initializedAt: new Date().toISOString(), version: VERSION });
    }
    return { initialized: true, seeded };
  } catch (err) {
    console.error("Failed to initialize Firestore data:", err);
    return { initialized: false, seeded };
  }
}
