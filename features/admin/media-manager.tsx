"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UploadCloud, Play, Image as ImageIcon, Film, Trash2, Copy } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { adminData, type AdminMediaRow } from "@/services/adminData";

export function MediaManager() {
  const [data, setData] = React.useState<AdminMediaRow[]>(adminData.media);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "image" | "video">("all");
  const [deleting, setDeleting] = React.useState<AdminMediaRow | null>(null);

  const filtered = data.filter(
    (r) => (filter === "all" || r.type === filter) && r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: AdminColumn<AdminMediaRow>[] = [
    {
      key: "preview",
      header: "Preview",
      render: (r) => (
        <div className="relative h-12 w-20 overflow-hidden rounded-lg border">
          {r.type === "image" && r.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.src} alt={r.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              {r.type === "video" ? <Play className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            </div>
          )}
        </div>
      ),
    },
    { key: "name", header: "File", render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "type", header: "Type", render: (r) => <Badge variant="outline" className="capitalize">{r.type}</Badge> },
    { key: "size", header: "Size", render: (r) => <span className="tabular-nums text-sm">{r.size}</span> },
    { key: "usedIn", header: "Used in", render: (r) => <span className="text-sm text-muted-foreground">{r.usedIn}</span> },
    { key: "uploaded", header: "Uploaded", render: (r) => <span className="text-xs text-muted-foreground">{r.uploadedAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description={`${data.length} files stored`}
        action={
          <Button onClick={() => toast.success("Upload queued")}>
            <UploadCloud className="h-4 w-4" /> Upload
          </Button>
        }
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="group overflow-hidden rounded-2xl border bg-background"
          >
            <div className="relative aspect-video bg-muted">
              {m.type === "image" && m.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.src} alt={m.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Film className="h-8 w-8" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="icon-sm" variant="secondary" onClick={() => toast.success("Copied URL")}><Copy className="h-4 w-4" /></Button>
                <Button size="icon-sm" variant="secondary" onClick={() => setDeleting(m)}><Trash2 className="h-4 w-4 text-danger" /></Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <p className="truncate text-xs font-semibold">{m.name}</p>
              <span className="shrink-0 text-[10px] uppercase text-muted-foreground">{m.size}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete file?"
        description={`This will permanently delete "${deleting?.name}".`}
        onConfirm={() => { if (deleting) { setData((d) => d.filter((r) => r.id !== deleting.id)); toast.success("File deleted"); } }}
      />
    </div>
  );
}
