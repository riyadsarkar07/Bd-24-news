"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UploadCloud, Play, Image as ImageIcon, Trash2, Copy, Loader2, X } from "lucide-react";
import { PageHeader, Toolbar, ConfirmDialog } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import {
  uploadMediaFile,
  deleteMediaItem,
  subscribeMedia,
  type MediaItem,
} from "@/services/mediaService";
import { cn } from "@/lib/utils";

export function MediaManager() {
  const [data, setData] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "image" | "video">("all");
  const [deleting, setDeleting] = React.useState<MediaItem | null>(null);
  const [preview, setPreview] = React.useState<MediaItem | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return subscribeMedia((items) => {
      setData(items);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter(
    (r) => (filter === "all" || r.type === filter) && r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const item = await uploadMediaFile(file, (p) => setProgress(p));
      toast.success("Upload complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMediaItem(deleting);
      setData((d) => d.filter((r) => r.id !== deleting.id));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  const copyUrl = async (m: MediaItem) => {
    try {
      await navigator.clipboard.writeText(m.src);
      toast.success("URL copied to clipboard");
    } catch {
      toast.success("URL copied");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description={`${data.length} files stored`}
        action={
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 text-muted-foreground transition-colors hover:border-brand hover:text-brand",
          dragging && "border-brand bg-brand/5 text-brand",
        )}
      >
        <UploadCloud className="h-8 w-8" />
        <p className="text-sm font-semibold">Drag & drop files here, or click to browse</p>
        <p className="text-xs">PNG, JPG, GIF, WebP, MP4 — stored in Firebase Storage</p>
        {uploading && (
          <div className="w-full max-w-sm space-y-1">
            <Progress value={progress} className="h-1.5" />
            <p className="text-center text-xs font-semibold">{progress}%</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search files…"
        actions={
          <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
            {(["all", "image", "video"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition-all ${filter === f ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="group overflow-hidden rounded-2xl border bg-background"
            >
              <button
                type="button"
                onClick={() => setPreview(m)}
                className="relative block aspect-video w-full bg-muted"
              >
                {m.type === "image" && m.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.src} alt={m.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {m.type === "video" ? <Play className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon-sm" variant="secondary" onClick={(e) => { e.stopPropagation(); void copyUrl(m); }}><Copy className="h-4 w-4" /></Button>
                  <Button size="icon-sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setDeleting(m); }}><Trash2 className="h-4 w-4 text-danger" /></Button>
                </div>
              </button>
              <div className="flex items-center justify-between p-3">
                <p className="truncate text-xs font-semibold">{m.name}</p>
                <span className="shrink-0 text-[10px] uppercase text-muted-foreground">{m.sizeLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold">No files found</p>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete file?"
        description={`This will permanently delete "${deleting?.name}" from Storage and Firestore.`}
        onConfirm={handleDelete}
      />

      {preview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {preview.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.src} alt={preview.name} className="max-h-[80vh] rounded-xl object-contain" />
            ) : (
              <video src={preview.src} controls autoPlay className="max-h-[80vh] rounded-xl" />
            )}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{preview.name}</p>
              <Badge variant="outline" className="border-white/20 text-white">{preview.sizeLabel}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
