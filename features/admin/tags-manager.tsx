"use client";

import * as React from "react";
import { Plus, Flame, Trash2, Hash } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, ConfirmDialog, BoolBadge, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { adminData, type AdminTagRow } from "@/services/adminData";

export function TagsManager() {
  const [data, setData] = React.useState<AdminTagRow[]>(adminData.tags);
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<AdminTagRow | null>(null);
  const [name, setName] = React.useState("");

  const filtered = data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const columns: AdminColumn<AdminTagRow>[] = [
    {
      key: "name",
      header: "Tag",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-bold">{r.name}</span>
          {r.trending && <Badge className="gap-1 bg-brand/15 text-brand"><Flame className="h-3 w-3" /> Trending</Badge>}
        </div>
      ),
    },
    { key: "slug", header: "Slug", render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">#{r.slug}</code> },
    { key: "articles", header: "Articles", className: "text-right", render: (r) => <span className="tabular-nums">{r.articles}</span> },
    { key: "views", header: "Total views", className: "text-right", render: (r) => <span className="tabular-nums">{r.views.toLocaleString()}</span> },
    { key: "trending", header: "Trending", render: (r) => <BoolBadge value={r.trending} /> },
  ];

  const save = () => {
    if (!name.trim()) {
      toast.error("Tag name is required");
      return;
    }
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    setData((d) => [{ id: crypto.randomUUID(), name: name.trim(), slug, articles: 0, views: 0, trending: false }, ...d]);
    setName("");
    setOpen(false);
    toast.success("Tag created");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description={`${data.length} tags in the system`}
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Tag</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search tags…" />
      <AdminTable columns={columns} data={filtered} onDelete={(r) => setDeleting(r)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Tag</DialogTitle>
            <DialogDescription>Create a new content tag.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="tag-name">Tag name</Label>
            <Input id="tag-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="বৃষ্টি" autoFocus />
            <p className="text-xs text-muted-foreground">Slug: #{name.trim().toLowerCase().replace(/\s+/g, "-") || "…"}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete tag?"
        description={`This will remove the tag "${deleting?.name}" from all articles.`}
        onConfirm={() => { if (deleting) { setData((d) => d.filter((r) => r.id !== deleting.id)); toast.success("Tag deleted"); } }}
      />
    </div>
  );
}
