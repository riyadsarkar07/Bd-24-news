import { getFirebaseDb } from "@/lib/firebase/client";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";

export interface BackupRow {
  id: string;
  label: string;
  createdAt: string;
  size: string;
  collections: string[];
}

const COLLECTIONS = [
  "articles",
  "categories",
  "tags",
  "authors",
  "users",
  "roles",
  "ads",
  "subscribers",
  "comments",
  "newsletters",
  "settings",
  "media",
];

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export async function exportSnapshot(): Promise<Record<string, unknown[]>> {
  const db = getFirebaseDb();
  if (!db) return {};
  const snapshot: Record<string, unknown[]> = {};
  for (const name of COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, name));
      snapshot[name] = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    } catch (err) {
      console.error(`Failed to export ${name}:`, err);
      snapshot[name] = [];
    }
  }
  return snapshot;
}

export async function createBackup(label: string): Promise<BackupRow> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const snapshot = await exportSnapshot();
  const json = JSON.stringify(snapshot);
  const id = `backup-${Date.now()}`;
  const row: BackupRow = {
    id,
    label: label || "Full site backup",
    createdAt: new Date().toISOString(),
    size: formatBytes(new Blob([json]).size),
    collections: COLLECTIONS,
  };
  await setDoc(doc(db, "backups", id), { ...row, data: json });
  return row;
}

export async function listBackups(): Promise<BackupRow[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, "backups"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        label: (data.label as string) ?? "Backup",
        createdAt: (data.createdAt as string) ?? "",
        size: (data.size as string) ?? formatBytes(String(data.data ?? "").length),
        collections: Array.isArray(data.collections) ? (data.collections as string[]) : [],
      };
    });
  } catch (err) {
    console.error("Failed to list backups:", err);
    return [];
  }
}

export async function deleteBackup(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, "backups", id));
}

export async function restoreBackup(id: string): Promise<number> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  const snap = await getDoc(doc(db, "backups", id));
  if (!snap.exists()) throw new Error("Backup not found");
  const snapshot = JSON.parse((snap.data().data as string) ?? "{}") as Record<string, unknown[]>;
  return restoreSnapshot(snapshot);
}

export async function restoreSnapshot(snapshot: Record<string, unknown[]>): Promise<number> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured.");
  let written = 0;
  for (const name of COLLECTIONS) {
    const rows = snapshot[name];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const batch = writeBatch(db);
    rows.forEach((row) => {
      const { _id, ...rest } = row as { _id?: string } & Record<string, unknown>;
      const id = typeof _id === "string" && _id ? _id : `doc-${written}-${Date.now()}`;
      batch.set(doc(db, name, id), { ...rest, updatedAt: new Date().toISOString() });
      written += 1;
    });
    await batch.commit();
  }
  return written;
}
