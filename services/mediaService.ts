import { getSupabase, getSupabaseEndpoints } from "@/lib/supabase/client";

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
    sizeLabel: (data.size_label as string) ?? formatBytes(Number(data.size ?? 0)),
    path: (data.path as string) ?? "",
    uploadedAt: (data.uploaded_at as string) ?? new Date().toISOString(),
    usedIn: (data.used_in as string) ?? "—",
  };
}

function encodePath(path: string): string {
  return path.split("/").map((seg) => encodeURIComponent(seg)).join("/");
}

function uploadWithProgress(
  url: string,
  key: string,
  path: string,
  file: File,
  token: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${url}/storage/v1/object/media/${encodePath(path)}`);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.timeout = 120000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed: network error"));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));
    xhr.onabort = () => reject(new Error("Upload was cancelled."));
    xhr.send(file);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        window.clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function uploadMediaFile(file: File, onProgress?: (percent: number) => void): Promise<MediaItem> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { url: endpointUrl, key: endpointKey } = getSupabaseEndpoints();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user ?? undefined;
  const token = sessionData?.session?.access_token ?? "";
  const uid = user?.id ?? "admin";
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const path = `media/${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

  if (token) {
    await uploadWithProgress(endpointUrl, endpointKey, path, file, token, onProgress);
  } else {
    await withTimeout(
      supabase.storage.from("media").upload(path, file, { upsert: true, contentType: file.type }),
      120000,
      "Upload timed out. Please try again.",
    );
  }

  const { data: publicData } = supabase.storage.from("media").getPublicUrl(path);
  const url = publicData.publicUrl;
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
  const { error: dbError } = await supabase
    .from("media")
    .upsert(
      { id: path, name: item.name, src: url, type, size: file.size, size_label: item.sizeLabel, path, uploaded_at: item.uploadedAt, used_in: "—" },
      { onConflict: "id" },
    );
  if (dbError) {
    console.error("Failed to save media record:", dbError);
  }
  return item;
}

export async function listMedia(): Promise<MediaItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("media").select("*").order("uploaded_at", { ascending: false });
    return (data ?? []).map((r) => mapMediaDoc(String((r as Record<string, unknown>).id), r as Record<string, unknown>));
  } catch (err) {
    console.error("Supabase media read failed:", err);
    return [];
  }
}

export function subscribeMedia(listener: (items: MediaItem[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    try {
      const items = await listMedia();
      if (!stopped) listener(items);
    } catch (err) {
      console.error("Supabase media poll error:", err);
    }
  };
  void run();
  const timer = window.setInterval(() => void run(), 10000);
  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

export async function deleteMediaItem(item: MediaItem): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  if (item.id) {
    try {
      await supabase.from("media").delete().eq("id", item.id);
    } catch (err) {
      console.error("Failed to delete media record:", err);
    }
  }
  if (item.path) {
    try {
      await supabase.storage.from("media").remove([item.path]);
    } catch (err) {
      console.error("Failed to delete storage object:", err);
    }
  }
}

export { formatBytes };
