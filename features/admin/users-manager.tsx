"use client";

import * as React from "react";
import { UserRound, Plus } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {
  listUsers,
  subscribeUsers,
  updateUser,
  saveUser,
  deleteUser,
  type AdminUserRow,
  type UserRole,
  type UserStatus,
} from "@/services/cmsService";

const ROLES: UserRole[] = ["Admin", "Editor", "Journalist", "Subscriber"];

export function UsersManager() {
  const [data, setData] = React.useState<AdminUserRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<AdminUserRow | null>(null);
  const [newEmail, setNewEmail] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [newRole, setNewRole] = React.useState<UserRole>("Subscriber");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    listUsers().then((rows) => mounted && setData(rows));
    const unsub = subscribeUsers((rows) => mounted && setData(rows));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const filtered = data.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()),
  );

  const changeRole = async (row: AdminUserRow, role: UserRole) => {
    const previous = row.role;
    setData((d) => d.map((r) => (r.id === row.id ? { ...r, role } : r)));
    try {
      await updateUser(row.id, { role });
      toast.success(`${row.name} is now ${role}`);
    } catch {
      setData((d) => d.map((r) => (r.id === row.id ? { ...r, role: previous } : r)));
      toast.error("Failed to update role");
    }
  };

  const changeStatus = async (row: AdminUserRow, status: UserStatus) => {
    const previous = row.status;
    setData((d) => d.map((r) => (r.id === row.id ? { ...r, status } : r)));
    try {
      await updateUser(row.id, { status });
      toast.success(status === "banned" ? `${row.email} banned` : `${row.email} ${status}`);
    } catch {
      setData((d) => d.map((r) => (r.id === row.id ? { ...r, status: previous } : r)));
      toast.error("Failed to update status");
    }
  };

  const addUser = async () => {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("A valid email is required");
      return;
    }
    setSaving(true);
    try {
      await saveUser(newEmail, {
        name: newName.trim() || newEmail.split("@")[0]!,
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        status: "active",
      });
      toast.success(`Added ${newEmail.trim().toLowerCase()}`);
      setAddOpen(false);
      setNewEmail("");
      setNewName("");
    } catch {
      toast.error("Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  const columns: AdminColumn<AdminUserRow>[] = [
    {
      key: "user",
      header: "User",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={r.avatar} alt={r.name} />
            <AvatarFallback className="bg-brand/10 text-brand"><UserRound className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <Select value={r.role} onValueChange={(v) => changeRole(r, v as UserRole)}>
          <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { key: "posts", header: "Posts", className: "text-right", render: (r) => <span className="tabular-nums">{r.posts}</span> },
    { key: "joined", header: "Joined", render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.joinedAt).toLocaleDateString()}</span> },
    { key: "lastActive", header: "Last active", render: (r) => <span className="text-xs text-muted-foreground">{r.lastActive ? new Date(r.lastActive).toLocaleDateString() : "—"}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Select value={r.status} onValueChange={(v) => changeStatus(r, v as UserStatus)}>
          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${data.length} registered users`}
        action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add user</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search users…" />
      <AdminTable columns={columns} data={filtered} onDelete={(r) => setDeleting(r)} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Register an existing account for admin panel access. The email must already exist in Firebase Authentication.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name (optional)" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addUser} disabled={saving}>{saving ? "Adding…" : "Add user"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Remove user?"
        description={`This will remove "${deleting?.email}" from the admin panel. It does not delete the Firebase Authentication account.`}
        onConfirm={async () => {
          if (deleting) {
            try {
              await deleteUser(deleting.id);
              setData((d) => d.filter((r) => r.id !== deleting.id));
              toast.success("User removed");
            } catch {
              toast.error("Failed to remove user");
            }
          }
        }}
      />
    </div>
  );
}
