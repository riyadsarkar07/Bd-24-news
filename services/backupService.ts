import { getSupabase } from "@/lib/supabase/client";

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
  "profiles",
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
  const supabase = getSupabase();
  if (!supabase) return {};
  const snapshot: Record<string, unknown[]> = {};
  for (const table of COLLECTIONS) {
    try {
      const { data } = await supabase.from(table).select("*");
      snapshot[table] = (data ?? []).map((r) => ({ _id: (r as Record<string, unknown>).id, ...(r as Record<string, unknown>) }));
    } catch (err) {
      console.error(`Failed to export ${table}:`, err);
      snapshot[table] = [];
    }
  }
  return snapshot;
}

export async function createBackup(label: string): Promise<BackupRow> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
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
  const { error } = await supabase.from("backups").insert({ ...row, data: JSON.parse(json) });
  if (error) throw error;
  return row;
}

export async function listBackups(): Promise<BackupRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("backups").select("id,label,created_at,size,collections,data").order("created_at", { ascending: false });
    return (data ?? []).map((d) => {
      const raw = d as Record<string, unknown>;
      return {
        id: typeof raw.id === "string" ? raw.id : String(raw.id ?? ""),
        label: typeof raw.label === "string" ? raw.label : "Backup",
        createdAt: typeof raw.created_at === "string" ? raw.created_at : "",
        size: typeof raw.size === "string" ? raw.size : formatBytes(String(JSON.stringify(raw.data ?? "")).length),
        collections: Array.isArray(raw.collections) ? (raw.collections as string[]) : [],
      };
    });
  } catch (err) {
    console.error("Failed to list backups:", err);
    return [];
  }
}

export async function deleteBackup(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("backups").delete().eq("id", id);
}

export async function restoreBackup(id: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data } = await supabase.from("backups").select("data").eq("id", id).limit(1).maybeSingle();
  if (!data?.data) throw new Error("Backup not found");
  return restoreSnapshot(data.data as Record<string, unknown[]>);
}

export async function restoreSnapshot(snapshot: Record<string, unknown[]>): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  let written = 0;
  for (const table of COLLECTIONS) {
    const rows = snapshot[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const cleaned = rows.map((row) => {
      const { _id, ...rest } = row as { _id?: string } & Record<string, unknown>;
      return rest;
    });
    const { error } = await supabase.from(table).upsert(cleaned);
    if (error) {
      console.error(`Failed to restore ${table}:`, error);
    } else {
      written += cleaned.length;
    }
  }
  return written;
}
