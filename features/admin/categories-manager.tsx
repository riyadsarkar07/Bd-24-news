"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, BoolBadge, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { adminData, type AdminCategoryRow } from "@/services/adminData";

type Draft = Omit<AdminCategoryRow, "id" | "articles" | "status"> & { id?: string; status?: AdminCategoryRow["status"] };

export function CategoriesManager() {
  const [data, setData] = React.useState<AdminCategoryRow[]>(adminData.categories);
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<AdminCategoryRow | null>(null);
  const [draft, setDraft] = React.useState<Draft>({ slug: "", nameBn: "", name: "", color: "#E50914", menu: true, featured: false });

  const filtered = data.filter((r) => r.nameBn.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase()));

  const columns: AdminColumn<AdminCategoryRow>[] = [
    {
      key: "name",
      header: "Category",
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
          <div>
            <p className="font-bold">{r.nameBn}</p>
            <p className="text-xs text-muted-foreground">{r.name}</p>
          </div>
        </div>
      ),
    },
    { key: "slug", header: "Slug", render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/{r.slug}</code> },
    { key: "articles", header: "Articles", className: "text-right", render: (r) => <span className="tabular-nums">{r.articles.toLocaleString()}</span> },
    { key: "menu", header: "Menu", render: (r) => <BoolBadge value={r.menu} /> },
    { key: "featured", header: "Featured", render: (r) => <BoolBadge value={r.featured} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const openEdit = (row?: AdminCategoryRow) => {
    setDraft(row ? { ...row } : { slug: "", nameBn: "", name: "", color: "#E50914", menu: true, featured: false });
    setOpen(true);
  };

  const save = () => {
    if (!draft.nameBn || !draft.name) {
      toast.error("Name is required");
      return;
    }
    if (draft.id) {
      setData((d) => d.map((r) => (r.id === draft.id ? { ...r, ...draft, status: draft.status ?? "active" } as AdminCategoryRow : r)));
      toast.success("Category updated");
    } else {
      const row: AdminCategoryRow = { ...draft, id: crypto.randomUUID(), articles: 0, status: (draft.status as AdminCategoryRow["status"]) ?? "active" };
      setData((d) => [row, ...d]);
      toast.success("Category created");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description={`${data.length} categories in the system`}
        action={<Button onClick={() => openEdit()}><Plus className="h-4 w-4" /> New Category</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search categories…" />
      <AdminTable columns={columns} data={filtered} onDelete={(r) => setDeleting(r)} actions={(r) => (
        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      )} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>Configure category details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bengali name</Label>
                <Input value={draft.nameBn} onChange={(e) => setDraft({ ...draft, nameBn: e.target.value })} placeholder="বাংলাদেশ" />
              </div>
              <div className="space-y-2">
                <Label>English name</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Bangladesh" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase() })} placeholder="bangladesh" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border bg-transparent" />
                  <code className="text-xs text-muted-foreground">{draft.color}</code>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={draft.status ?? "active"} onValueChange={(v) => setDraft({ ...draft, status: v as AdminCategoryRow["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="cat-menu">Show in menu</Label>
                <Switch id="cat-menu" checked={draft.menu} onCheckedChange={(v) => setDraft({ ...draft, menu: v })} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="cat-featured">Featured</Label>
                <Switch id="cat-featured" checked={draft.featured} onCheckedChange={(v) => setDraft({ ...draft, featured: v })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{draft.id ? "Save changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete category?"
        description={`This will remove "${deleting?.nameBn}". Existing articles will not be deleted.`}
        onConfirm={() => { if (deleting) { setData((d) => d.filter((r) => r.id !== deleting.id)); toast.success("Category deleted"); } }}
      />
    </div>
  );
}
