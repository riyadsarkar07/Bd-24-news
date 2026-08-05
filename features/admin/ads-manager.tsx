"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";
import { adminData, type AdminAdRow } from "@/services/adminData";

const typeColor: Record<AdminAdRow["type"], string> = {
  banner: "bg-accentblue/15 text-accentblue",
  sidebar: "bg-success/15 text-success",
  inline: "bg-warning/15 text-warning",
  native: "bg-brand/15 text-brand",
};

export function AdsManager() {
  const [data, setData] = React.useState<AdminAdRow[]>(adminData.ads);
  const [search, setSearch] = React.useState("");
  const [deleting, setDeleting] = React.useState<AdminAdRow | null>(null);
  const [editing, setEditing] = React.useState<AdminAdRow | null>(null);
  const [name, setName] = React.useState("");

  const filtered = data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.position.toLowerCase().includes(search.toLowerCase()));

  const columns: AdminColumn<AdminAdRow>[] = [
    { key: "name", header: "Ad unit", render: (r) => <span className="font-bold">{r.name}</span> },
    { key: "position", header: "Position", render: (r) => <span className="text-sm">{r.position}</span> },
    {
      key: "type",
      header: "Type",
      render: (r) => <Badge variant="outline" className={`border-0 capitalize ${typeColor[r.type]}`}>{r.type}</Badge>,
    },
    { key: "size", header: "Size", render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.size}</code> },
    {
      key: "impressions",
      header: "Impressions",
      className: "text-right",
      render: (r) => <span className="tabular-nums">{r.impressions.toLocaleString()}</span>,
    },
    {
      key: "ctr",
      header: "CTR",
      render: (r) => (
        <div className="w-28">
          <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
            <span>{r.clicks.toLocaleString()} clicks</span>
            <span>{r.ctr}%</span>
          </div>
          <Progress value={Math.min(r.ctr * 100, 100)} className="h-1.5" />
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const toggle = (row: AdminAdRow) => {
    setData((d) => d.map((r) => (r.id === row.id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r)));
    toast.success(row.status === "active" ? "Ad paused" : "Ad activated");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advertisements"
        description={`${data.filter((r) => r.status === "active").length} active ad units`}
        action={<Button onClick={() => { setEditing(null); setName(""); setDeleting(null); setEditing({ id: crypto.randomUUID(), name: "", position: "Sidebar", size: "300×250", type: "banner", impressions: 0, clicks: 0, ctr: 0, status: "inactive" }); }}><Plus className="h-4 w-4" /> New Ad Unit</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search ad units…" />
      <AdminTable
        columns={columns}
        data={filtered}
        onDelete={(r) => setDeleting(r)}
        actions={(r) => (
          <>
            <Button variant="ghost" size="icon-sm" onClick={() => toggle(r)} aria-label="Toggle status">
              {r.status === "active" ? <StatusBadge status="inactive" /> : <StatusBadge status="active" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(r); setName(r.name); }} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.name ? "Edit Ad Unit" : "New Ad Unit"}</DialogTitle>
            <DialogDescription>Configure the advertisement slot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ad unit name</Label>
              <Input value={editing?.name ?? ""} onChange={(e) => setEditing((p) => p && { ...p, name: e.target.value })} placeholder="Header Leaderboard" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={editing?.position ?? "Sidebar"} onValueChange={(v) => setEditing((p) => p && { ...p, position: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Header", "Sidebar", "Article body", "Home", "Mobile", "Footer"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editing?.type ?? "banner"} onValueChange={(v) => setEditing((p) => p && { ...p, type: v as AdminAdRow["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["banner", "sidebar", "inline", "native"] as const).map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Input value={editing?.size ?? ""} onChange={(e) => setEditing((p) => p && { ...p, size: e.target.value })} placeholder="728×90" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => { setData((d) => (editing && d.some((r) => r.id === editing.id) ? d.map((r) => (r.id === editing.id ? editing : r)) : (editing ? [...d, editing] : d))); setEditing(null); toast.success("Ad unit saved"); }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete ad unit?"
        description={`This will remove "${deleting?.name}".`}
        onConfirm={() => { if (deleting) { setData((d) => d.filter((r) => r.id !== deleting.id)); toast.success("Ad unit deleted"); } }}
      />
    </div>
  );
}
