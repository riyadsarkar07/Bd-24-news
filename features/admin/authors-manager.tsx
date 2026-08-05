"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BadgeCheck, Trash2 } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, BoolBadge, type AdminColumn } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { adminData, type AdminAuthorRow } from "@/services/adminData";

export function AuthorsManager() {
  const [data, setData] = React.useState<AdminAuthorRow[]>(adminData.authors);
  const [search, setSearch] = React.useState("");
  const [deleting, setDeleting] = React.useState<AdminAuthorRow | null>(null);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authors"
        description={`${data.length} authors in the system`}
        action={
          <Link href="/authors">
            <Button><Plus className="h-4 w-4" /> New Author</Button>
          </Link>
        }
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search authors…" />
      <AdminTable columns={columns} data={filtered} onDelete={(r) => setDeleting(r)} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Remove author?"
        description={`This will remove "${deleting?.nameBn}" from the author roster.`}
        onConfirm={() => { if (deleting) { setData((d) => d.filter((r) => r.id !== deleting.id)); toast.success("Author removed"); } }}
      />
    </div>
  );
}
