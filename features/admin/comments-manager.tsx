"use client";

import * as React from "react";
import { Check, X, ThumbsUp } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import {
  listComments,
  subscribeCommentsAdmin,
  updateComment,
  deleteComment,
  type AdminCommentRow,
} from "@/services/cmsService";

export function CommentsManager() {
  const [data, setData] = React.useState<AdminCommentRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "published" | "pending" | "spam">("all");
  const [deleting, setDeleting] = React.useState<AdminCommentRow | null>(null);

  React.useEffect(() => {
    let mounted = true;
    listComments().then((rows) => mounted && setData(rows));
    const unsub = subscribeCommentsAdmin((rows) => mounted && setData(rows));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const filtered = data.filter(
    (r) => (filter === "all" || r.status === filter) && (r.content.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase())),
  );

  const columns: AdminColumn<AdminCommentRow>[] = [
    {
      key: "comment",
      header: "Comment",
      className: "min-w-[320px]",
      render: (r) => (
        <div>
          <p className="text-sm font-semibold">{r.content || "—"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">on <span className="font-medium text-foreground">{r.article || r.articleId || "unknown article"}</span></p>
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={r.avatar} alt={r.author} />
            <AvatarFallback className="bg-brand/10 text-brand">{(r.author || "?").charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">{r.author}</span>
        </div>
      ),
    },
    { key: "likes", header: "Likes", className: "text-right", render: (r) => <span className="flex items-center justify-end gap-1 tabular-nums"><ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />{r.likes}</span> },
    { key: "created", header: "Posted", render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const setStatus = async (row: AdminCommentRow, status: AdminCommentRow["status"]) => {
    try {
      await updateComment(row.id, { status });
      toast.success(`Comment ${status}`);
    } catch {
      toast.error("Failed to update comment");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comments"
        description={`${data.filter((r) => r.status === "pending").length} pending moderation`}
      />
      <Toolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search comments…"
        actions={
          <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
            {(["all", "published", "pending", "spam"] as const).map((f) => (
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
      <AdminTable
        columns={columns}
        data={filtered}
        onDelete={(r) => setDeleting(r)}
        actions={(r) => (
          <>
            {r.status !== "published" && (
              <Button variant="ghost" size="icon-sm" onClick={() => setStatus(r, "published")} aria-label="Approve">
                <Check className="h-4 w-4 text-success" />
              </Button>
            )}
            {r.status !== "spam" && (
              <Button variant="ghost" size="icon-sm" onClick={() => setStatus(r, "spam")} aria-label="Mark spam">
                <X className="h-4 w-4 text-warning" />
              </Button>
            )}
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete comment?"
        description="This will permanently remove the comment and its replies."
        onConfirm={async () => {
          if (deleting) {
            try {
              await deleteComment(deleting.id);
              setData((d) => d.filter((r) => r.id !== deleting.id));
              toast.success("Comment deleted");
            } catch {
              toast.error("Failed to delete comment");
            }
          }
        }}
      />
    </div>
  );
}
