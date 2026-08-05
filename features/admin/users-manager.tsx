"use client";

import * as React from "react";
import { UserRound } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { adminData, type AdminUserRow } from "@/services/adminData";

const roleColor: Record<AdminUserRow["role"], string> = {
  Admin: "bg-brand/15 text-brand",
  Editor: "bg-accentblue/15 text-accentblue",
  Journalist: "bg-warning/15 text-warning",
  Subscriber: "bg-muted text-muted-foreground",
};

export function UsersManager() {
  const [data, setData] = React.useState<AdminUserRow[]>(adminData.users);
  const [search, setSearch] = React.useState("");

  const filtered = data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));

  const changeRole = (row: AdminUserRow, role: AdminUserRow["role"]) => {
    setData((d) => d.map((r) => (r.id === row.id ? { ...r, role } : r)));
    toast.success(`${row.name} is now ${role}`);
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
        <Select value={r.role} onValueChange={(v) => changeRole(r, v as AdminUserRow["role"])}>
          <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(["Admin", "Editor", "Journalist", "Subscriber"] as const).map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { key: "posts", header: "Posts", className: "text-right", render: (r) => <span className="tabular-nums">{r.posts}</span> },
    { key: "joined", header: "Joined", render: (r) => <span className="text-xs text-muted-foreground">{r.joinedAt}</span> },
    { key: "lastActive", header: "Last active", render: (r) => <span className="text-xs text-muted-foreground">{r.lastActive}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`${data.length} registered users`} />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search users…" />
      <AdminTable columns={columns} data={filtered} />
    </div>
  );
}
