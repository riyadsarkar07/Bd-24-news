"use client";

import * as React from "react";
import { Check, X, ThumbsUp, ShieldCheck, Reply } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { useAdminCollection } from "@/features/admin/use-admin-collection";
import { CollectionError, TableSkeleton } from "@/features/admin/collection-state";
import {
  subscribeCommentsAdmin,
  updateComment,
  deleteComment,
  replyToComment,
  type AdminCommentRow,
} from "@/services/cmsService";
import { formatDateTime } from "@/lib/utils";

export function CommentsManager() {
  const { data, setData, loading, error } = useAdminCollection<AdminCommentRow>(subscribeCommentsAdmin);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "published" | "pending" | "spam">("all");
  const [deleting, setDeleting] = React.useState<AdminCommentRow | null>(null);
  const [replying, setReplying] = React.useState<AdminCommentRow | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [replyBusy, setReplyBusy] = React.useState(false);

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
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
            {r.isOfficial && (
              <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                <ShieldCheck className="h-3 w-3" /> Official
              </span>
            )}
            <span>{r.content || "—"}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {r.parentId ? "reply on " : "on "}
            <span className="font-medium text-foreground">{r.article || r.articleId || "unknown article"}</span>
          </p>
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
    {
      key: "created",
      header: "Posted",
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {r.createdAt ? formatDateTime(r.createdAt) : "—"}
        </span>
      ),
    },
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

  const submitReply = async () => {
    if (!replying) return;
    if (replyText.trim().length < 2) {
      toast.error("Reply is too short");
      return;
    }
    try {
      setReplyBusy(true);
      await replyToComment(replying.articleId, replyText, replying.id, replying.article);
      toast.success("Official reply posted");
      setReplying(null);
      setReplyText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setReplyBusy(false);
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
      {error && <CollectionError />}
      {loading ? (
        <TableSkeleton />
      ) : (
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
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setReplying(r);
                  setReplyText("");
                }}
                aria-label="Reply as BD24News"
              >
                <Reply className="h-4 w-4 text-brand" />
              </Button>
              {r.status !== "spam" && (
                <Button variant="ghost" size="icon-sm" onClick={() => setStatus(r, "spam")} aria-label="Mark spam">
                  <X className="h-4 w-4 text-warning" />
                </Button>
              )}
            </>
          )}
          emptyTitle="No comments found"
          emptyDescription="Comments will appear here for moderation."
        />
      )}


      <Dialog open={!!replying} onOpenChange={(open) => !open && !replyBusy && setReplying(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> Reply as BD24News
            </DialogTitle>
            <DialogDescription>
              Posted as <span className="font-semibold">BD24News Editorial</span> and shown with an Official badge.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl border bg-muted/30 p-3 text-sm">
              <p className="text-xs font-semibold text-muted-foreground">{replying?.author}</p>
              <p className="mt-1">{replying?.content}</p>
            </div>
            <Textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write an official editorial reply…"
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplying(null)} disabled={replyBusy}>
              Cancel
            </Button>
            <Button onClick={submitReply} disabled={replyBusy || replyText.trim().length < 2}>
              Post official reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
