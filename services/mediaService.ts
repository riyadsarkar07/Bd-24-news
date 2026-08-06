import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { getFirebaseAuth } from "@/lib/firebase/client";

export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  name: string;
  src: string;
  type: MediaType;
  size: number;
  sizeLabel: string;
  path: string;
  uploadedAt: string;
  usedIn: string;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function mapMediaDoc(id: string, data: Record<string, unknown>): MediaItem {
  return {
    id,
    name: (data.name as string) ?? "untitled",
    src: (data.src as string) ?? "",
    type: (data.type as MediaType) ?? "image",
    size: Number(data.size ?? 0),
    sizeLabel: (data.sizeLabel as string) ?? formatBytes(Number(data.size ?? 0)),
    path: (data.path as string) ?? "",
    uploadedAt: (data.uploadedAt as string) ?? new Date().toISOString(),
    usedIn: (data.usedIn as string) ?? "—",
  };
}

export async function uploadMediaFile(file: File, onProgress?: (percent: number) => void): Promise<MediaItem> {
  const storage = getFirebaseStorage();
  const db = getFirebaseDb();
  if (!storage || !db) throw new Error("Firebase is not configured.");
  const user = getFirebaseAuth()?.currentUser;
  const uid = user?.uid ?? "admin";
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const path = `media/${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const ref = storageRef(storage, path);
  const task = uploadBytesResumable(ref, file);
  if (onProgress) {
    task.on("state_changed", (snap) => {
      const percent = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      onProgress(percent);
    });
  }
  await task;
  const url = await getDownloadURL(ref);
  const type: MediaType = file.type.startsWith("video") ? "video" : "image";
  const item: MediaItem = {
    id: path,
    name: file.name,
    src: url,
    type,
    size: file.size,
    sizeLabel: formatBytes(file.size),
    path,
    uploadedAt: new Date().toISOString(),
    usedIn: "—",
  };
  await setDoc(doc(db, "media", item.id), {
    name: item.name,
    src: url,
    type,
    size: file.size,
    sizeLabel: item.sizeLabel,
    path,
    uploadedAt: item.uploadedAt,
    usedIn: "—",
  });
  return item;
}

export async function listMedia(): Promise<MediaItem[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const q = query(collection(db, "media"), orderBy("uploadedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapMediaDoc(d.id, d.data() as Record<string, unknown>));
  } catch (err) {
    console.error("Firestore media read failed:", err);
    return [];
  }
}

export function subscribeMedia(listener: (items: MediaItem[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return () => {};
  const q = query(collection(db, "media"), orderBy("uploadedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => listener(snap.docs.map((d) => mapMediaDoc(d.id, d.data() as Record<string, unknown>))),
    (err) => console.error("Firestore media snapshot error:", err),
  );
}

export async function deleteMediaItem(item: MediaItem): Promise<void> {
  const db = getFirebaseDb();
  const storage = getFirebaseStorage();
  if (db) {
    try {
      await deleteDoc(doc(db, "media", item.id));
    } catch (err) {
      console.error("Failed to delete media doc:", err);
    }
  }
  if (storage && item.path) {
    try {
      await deleteObject(storageRef(storage, item.path));
    } catch (err) {
      console.error("Failed to delete storage object:", err);
    }
  }
}

export { formatBytes };
