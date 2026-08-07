"use client";

import * as React from "react";
import { Download, UserRound } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  listSubscribers,
  subscribeSubscribers,
  deleteSubscriber,
  type AdminSubscriberRow,
} from "@/services/cmsService";

export function SubscribersManager() {
  const [data, setData] = React.useState<AdminSubscriberRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [deleting, setDeleting] = React.useState<AdminSubscriberRow | null>(null);

  React.useEffect(() => {
    let mounted = true;
    listSubscribers().then((rows) => mounted && setData(rows));
    const unsub = subscribeSubscribers((rows) => mounted && setData(rows));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const filtered = data.filter((r) => r.email.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase()));

  const columns: AdminColumn<AdminSubscriberRow>[] = [
    {
      key: "subscriber",
      header: "Subscriber",
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accentblue/10 p-2 text-accentblue"><UserRound className="h-4 w-4" /></span>
          <div>
            <p className="font-bold">{r.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "source", header: "Source", render: (r) => <span className="text-sm">{r.source || "—"}</span> },
    { key: "subscribed", header: "Subscribed", render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.subscribedAt ? new Date(r.subscribedAt).toLocaleDateString() : "—"}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const exportCsv = () => {
    if (data.length === 0) {
      toast.error("No subscribers to export");
      return;
    }
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = [["name", "email", "subscribed", "status"], ...data.map((r) => [esc(r.name), esc(r.email), esc(r.subscribedAt), r.status])]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Subscribers exported");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscribers"
        description={`${data.filter((r) => r.status === "active").length} active subscribers`}
        action={<Button onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search subscribers…" />
      <AdminTable columns={columns} data={filtered} onDelete={(r) => setDeleting(r)} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Remove subscriber?"
        description={`"${deleting?.email}" will be unsubscribed.`}
        onConfirm={async () => {
          if (deleting) {
            try {
              await deleteSubscriber(deleting.id);
              setData((d) => d.filter((r) => r.id !== deleting.id));
              toast.success("Subscriber removed");
            } catch {
              toast.error("Failed to remove subscriber");
            }
          }
        }}
      />
    </div>
  );
}
