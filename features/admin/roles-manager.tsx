"use client";

import * as React from "react";
import { Plus, ShieldCheck, Lock } from "lucide-react";
import { PageHeader, AdminTable, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  listRoles,
  subscribeRoles,
  saveRole,
  deleteRole,
  type AdminRoleRow,
} from "@/services/cmsService";

const permissionPool = [
  "news:write", "news:publish", "news:delete", "comments:moderate", "media:upload",
  "media:manage", "users:manage", "roles:manage", "settings:edit", "analytics:view",
  "ads:manage", "newsletter:send", "backup:create", "restore:run", "seo:edit",
];

export function RolesManager() {
  const [data, setData] = React.useState<AdminRoleRow[]>([]);
  const [deleting, setDeleting] = React.useState<AdminRoleRow | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [perms, setPerms] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    listRoles().then((rows) => mounted && setData(rows));
    const unsub = subscribeRoles((rows) => mounted && setData(rows));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const togglePerm = (p: string) => setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const columns: AdminColumn<AdminRoleRow>[] = [
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-accentblue/10 p-2 text-accentblue">
            {r.system ? <Lock className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          </span>
          <div>
            <p className="font-bold">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      className: "min-w-[280px]",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.permissions.length > 6
            ? [...r.permissions.slice(0, 5), `+${r.permissions.length - 5} more`].map((p, i) => (
                <Badge key={p} variant="outline" className={cn(p.startsWith("+") && "text-muted-foreground")}>{p}</Badge>
              ))
            : r.permissions.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}
        </div>
      ),
    },
    { key: "users", header: "Users", className: "text-right", render: (r) => <span className="tabular-nums">{r.users.toLocaleString()}</span> },
  ];

  const create = async () => {
    if (!name) {
      toast.error("Role name is required");
      return;
    }
    setSaving(true);
    try {
      await saveRole(name.trim().toLowerCase(), { slug: name.trim().toLowerCase(), name, description, permissions: perms, system: false });
      setCreating(false);
      setName("");
      setDescription("");
      setPerms([]);
      toast.success("Role created");
    } catch {
      toast.error("Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description={`${data.length} roles configured`}
        action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Role</Button>}
      />
      <AdminTable columns={columns} data={data} onDelete={(r) => !r.system && setDeleting(r)} />

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Define a custom role with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contributor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input id="role-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Can write and submit articles" />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-3">
                {permissionPool.map((p) => (
                  <label key={p} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-muted">
                    <Checkbox checked={perms.includes(p)} onCheckedChange={() => togglePerm(p)} />
                    <code className="text-xs">{p}</code>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving}>{saving ? "Creating…" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete role?"
        description={`This will remove the "${deleting?.name}" role. Users with this role will lose access.`}
        onConfirm={async () => {
          if (deleting) {
            try {
              await deleteRole(deleting.id);
              setData((d) => d.filter((r) => r.id !== deleting.id));
              toast.success("Role deleted");
            } catch {
              toast.error("Failed to delete role");
            }
          }
        }}
      />
    </div>
  );
}
