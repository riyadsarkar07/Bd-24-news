"use client";

import * as React from "react";
import { Plus, BadgeCheck, Pencil } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, ConfirmDialog, BoolBadge, type AdminColumn } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {
  subscribeAuthors,
  saveAuthor,
  deleteAuthor,
  type AdminAuthorRow,
} from "@/services/cmsService";

type Draft = Omit<AdminAuthorRow, "id" | "articlesCount"> & { id?: string };

export function AuthorsManager() {
  const [data, setData] = React.useState<AdminAuthorRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [deleting, setDeleting] = React.useState<AdminAuthorRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>({ slug: "", nameBn: "", name: "", role: "Journalist", avatar: "", followers: 0, verified: false, active: true });

  React.useEffect(() => {
    let mounted = true;
    const unsub = subscribeAuthors((rows) => mounted && setData(rows));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const filtered = data.filter((r) => r.nameBn.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase()));

  const columns: AdminColumn<AdminAuthorRow>[] = [
    {
      key: "author",
      header: "Author",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={r.avatar} alt={r.name} />
            <AvatarFallback className="bg-brand/10 text-brand">{r.nameBn.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="flex items-center gap-1 font-bold">
              {r.nameBn}
              {r.verified && <BadgeCheck className="h-4 w-4 text-accentblue" />}
            </p>
            <p className="text-xs text-muted-foreground">{r.name}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (r) => <span className="text-sm">{r.role}</span> },
    { key: "articles", header: "Articles", className: "text-right", render: (r) => <span className="tabular-nums">{r.articlesCount}</span> },
    { key: "followers", header: "Followers", className: "text-right", render: (r) => <span className="tabular-nums">{r.followers.toLocaleString()}</span> },
    { key: "active", header: "Active", render: (r) => <BoolBadge value={r.active} /> },
  ];

  const openEdit = (row?: AdminAuthorRow) => {
    setDraft(row ? { ...row } : { slug: "", nameBn: "", name: "", role: "Journalist", avatar: "", followers: 0, verified: false, active: true });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.nameBn || !draft.name) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await saveAuthor(draft.id || draft.slug, {
        slug: draft.slug || draft.name,
        nameBn: draft.nameBn,
        name: draft.name,
        role: draft.role,
        avatar: draft.avatar,
        followers: draft.followers,
        verified: draft.verified,
        active: draft.active,
      });
      toast.success(draft.id ? "Author updated" : "Author created");
      setOpen(false);
    } catch {
      toast.error("Failed to save author");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authors"
        description={`${data.length} authors in the system`}
        action={<Button onClick={() => openEdit()}><Plus className="h-4 w-4" /> New Author</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search authors…" />
      <AdminTable
        columns={columns}
        data={filtered}
        onDelete={(r) => setDeleting(r)}
        actions={(r) => (
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)} aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit Author" : "New Author"}</DialogTitle>
            <DialogDescription>Manage the author roster.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bengali name</Label>
                <Input value={draft.nameBn} onChange={(e) => setDraft({ ...draft, nameBn: e.target.value })} placeholder="সালমান রহমান" />
              </div>
              <div className="space-y-2">
                <Label>English name</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Salman Rahman" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase() })} placeholder="salman-rahman" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Journalist" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input value={draft.avatar} onChange={(e) => setDraft({ ...draft, avatar: e.target.value })} placeholder="https://…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Followers</Label>
                <Input type="number" value={draft.followers} onChange={(e) => setDraft({ ...draft, followers: Number(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-6 pb-1">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={draft.verified} onChange={(e) => setDraft({ ...draft, verified: e.target.checked })} className="h-4 w-4 accent-brand" /> Verified
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="h-4 w-4 accent-brand" /> Active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : draft.id ? "Save changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Remove author?"
        description={`This will remove "${deleting?.nameBn}" from the author roster.`}
        onConfirm={async () => {
          if (deleting) {
            try {
              await deleteAuthor(deleting.id);
              setData((d) => d.filter((r) => r.id !== deleting.id));
              toast.success("Author removed");
            } catch {
              toast.error("Failed to remove author");
            }
          }
        }}
      />
    </div>
  );
}
