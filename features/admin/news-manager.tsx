"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Copy, LayoutGrid, List, Database, CheckCircle2, FileText, Eye, Minus, MessageSquareOff, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import type { Article } from "@/types";
import {
  listAllArticles,
  deleteArticle,
  deleteArticles,
  setArticlesStatus,
  duplicateArticle,
  seedSampleArticles,
  setArticleCommentsEnabled,
} from "@/services/adminService";
import { setArticleViews, adjustArticleViews } from "@/services/viewService";
import { formatDateTime } from "@/lib/utils";

type ArticleRow = Pick<Article, "id" | "slug" | "title" | "titleBn" | "category" | "authorAvatar" | "author" | "publishedAt" | "views" | "featured" | "breaking" | "commentsEnabled"> & { status: "published" | "draft" };

export function NewsManager() {
  const [data, setData] = React.useState<ArticleRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "published" | "draft">("all");
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [deleting, setDeleting] = React.useState<ArticleRow | null>(null);
  const [seeding, setSeeding] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [viewsRow, setViewsRow] = React.useState<ArticleRow | null>(null);
  const [viewsValue, setViewsValue] = React.useState("0");
  const [viewsBusy, setViewsBusy] = React.useState(false);
  const [commentBusyId, setCommentBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    listAllArticles()
      .then((rows) => setData(rows.map((r) => ({ ...r, status: r.status ?? "published" }))))
      .catch(() => toast.error("Failed to load articles"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = data.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (r.title.toLowerCase().includes(search.toLowerCase()) || r.titleBn.toLowerCase().includes(search.toLowerCase())),
  );

  const selectedVisible = selected.filter((id) => filtered.some((r) => r.id === id));

  async function bulkSetStatus(status: "published" | "draft") {
    if (selectedVisible.length === 0) return;
    try {
      setBulkBusy(true);
      await setArticlesStatus(selectedVisible, status);
      setData((rows) => rows.map((r) => (selectedVisible.includes(r.id) ? { ...r, status } : r)));
      toast.success(
        status === "published"
          ? `Published ${selectedVisible.length} article(s)`
          : `Moved ${selectedVisible.length} article(s) to drafts`,
      );
      setSelected([]);
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    if (selectedVisible.length === 0) return;
    try {
      setBulkBusy(true);
      await deleteArticles(selectedVisible);
      setData((rows) => rows.filter((r) => !selectedVisible.includes(r.id)));
      toast.success(`Deleted ${selectedVisible.length} article(s)`);
      setSelected([]);
      setBulkDeleteOpen(false);
    } catch {
      toast.error("Bulk delete failed");
    } finally {
      setBulkBusy(false);
    }
  }

  function openViews(r: ArticleRow) {
    setViewsRow(r);
    setViewsValue(String(r.views));
  }

  function applyViews(next: number) {
    setData((rows) => rows.map((x) => (x.id === viewsRow?.id ? { ...x, views: next } : x)));
    setViewsValue(String(next));
    setViewsRow((r) => (r ? { ...r, views: next } : r));
  }

  async function changeViews(delta: number) {
    if (!viewsRow) return;
    try {
      setViewsBusy(true);
      const next = await adjustArticleViews(viewsRow.id, delta);
      applyViews(next);
      toast.success(`Views updated to ${next.toLocaleString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update views");
    } finally {
      setViewsBusy(false);
    }
  }

  async function saveViews() {
    if (!viewsRow) return;
    const parsed = Number(viewsValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Enter a valid non-negative number");
      return;
    }
    try {
      setViewsBusy(true);
      const next = await setArticleViews(viewsRow.id, Math.floor(parsed));
      applyViews(next);
      toast.success(`Views set to ${next.toLocaleString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set views");
    } finally {
      setViewsBusy(false);
    }
  }

  async function toggleComments(r: ArticleRow) {
    const next = r.commentsEnabled === false;
    try {
      setCommentBusyId(r.id);
      await setArticleCommentsEnabled(r.id, next);
      setData((rows) => rows.map((x) => (x.id === r.id ? { ...x, commentsEnabled: next } : x)));
      toast.success(next ? "Comments enabled" : "Comments disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update comments");
    } finally {
      setCommentBusyId(null);
    }
  }

  const columns: AdminColumn<ArticleRow>[] = [
    {
      key: "title",
      header: "Article",
      className: "min-w-[280px]",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 rounded-lg border">
            <AvatarImage src={r.authorAvatar} alt={r.author} />
            <AvatarFallback className="rounded-lg bg-brand/10 text-brand">{r.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="line-clamp-1 font-bold">{r.titleBn}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{r.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <Badge variant="outline">{r.category}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "flags",
      header: "Flags",
      render: (r) => (
        <div className="flex gap-1">
          {r.featured && <Badge className="bg-warning/15 text-warning">Featured</Badge>}
          {r.breaking && <Badge className="bg-brand/15 text-brand">Breaking</Badge>}
        </div>
      ),
    },
    {
      key: "views",
      header: "Views",
      className: "text-right",
      render: (r) => (
        <button
          type="button"
          onClick={() => openViews(r)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 tabular-nums transition-colors hover:bg-brand/10 hover:text-brand"
          title="Manage views"
        >
          <Eye className="h-3.5 w-3.5" />
          {r.views.toLocaleString()}
        </button>
      ),
    },
    {
      key: "comments",
      header: "Comments",
      className: "text-center",
      render: (r) => (
        <button
          type="button"
          disabled={commentBusyId === r.id}
          onClick={() => toggleComments(r)}
          title={r.commentsEnabled === false ? "Enable comments" : "Disable comments"}
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-50"
        >
          {r.commentsEnabled === false ? (
            <>
              <MessageSquareOff className="h-3.5 w-3.5 text-danger" /> Off
            </>
          ) : (
            <>
              <MessageSquare className="h-3.5 w-3.5 text-success" /> On
            </>
          )}
        </button>
      ),
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(r.publishedAt)}</span>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteArticle(deleting.id);
      setData((d) => d.filter((x) => x.id !== deleting.id));
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (r: ArticleRow) => {
    try {
      const result = await duplicateArticle(r.id);
      toast.success("Article duplicated");
      load();
    } catch {
      toast.error("Failed to duplicate article");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const count = await seedSampleArticles();
      toast.success(`Imported ${count} sample articles`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import sample articles");
    } finally {
      setSeeding(false);
    }
  };

  const grid = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="rounded-2xl border bg-background p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 font-bold">{r.titleBn}</p>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.title}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <button type="button" onClick={() => openViews(r)} className="font-semibold text-foreground hover:text-brand">
              {r.views.toLocaleString()} views
            </button>
            <span>{formatDateTime(r.publishedAt)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Link href={`/admin/news/edit/${r.id}`}>
              <Button variant="outline" size="sm">
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setDeleting(r)}>
              <Trash2 className="h-3.5 w-3.5 text-danger" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="News"
        description={`${data.length} articles in the system`}
        action={
          <Link href="/admin/news/new">
            <Button>
              <Plus className="h-4 w-4" /> New Article
            </Button>
          </Link>
        }
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search articles…"
        actions={
          <>
            <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as typeof filter)}>
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="published">Published</ToggleGroupItem>
              <ToggleGroupItem value="draft">Drafts</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as typeof view)}>
              <ToggleGroupItem value="table"><List className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="grid"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </>
        }
      />

      {selectedVisible.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm">
          <span className="font-semibold">{selectedVisible.length} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkSetStatus("published")}>
              <CheckCircle2 className="h-4 w-4" /> Publish
            </Button>
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={() => bulkSetStatus("draft")}>
              <FileText className="h-4 w-4" /> Move to draft
            </Button>
            <Button size="sm" variant="destructive" disabled={bulkBusy} onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button size="sm" variant="ghost" disabled={bulkBusy} onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <Database className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-bold">No articles yet</p>
            <p className="text-sm text-muted-foreground">Import the sample articles or write your first one.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSeed} disabled={seeding}>
              <Database className="h-4 w-4" /> {seeding ? "Importing…" : "Import sample articles"}
            </Button>
            <Link href="/admin/news/new">
              <Button variant="outline">
                <Plus className="h-4 w-4" /> Write article
              </Button>
            </Link>
          </div>
        </div>
      ) : view === "table" ? (
        <AdminTable
          columns={columns}
          data={filtered}
          onDelete={(r) => setDeleting(r)}
          selection={{ selected, onChange: setSelected }}
          emptyTitle="No articles match"
          emptyDescription="Adjust your search or filter to find articles."
          actions={(r) => (
            <>
              <Link href={`/admin/news/edit/${r.id}`}>
                <Button variant="ghost" size="icon-sm" aria-label="Edit">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon-sm" aria-label="Duplicate" onClick={() => handleDuplicate(r)}>
                <Copy className="h-4 w-4" />
              </Button>
            </>
          )}
        />
      ) : (
        grid
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete article?"
        description="This will permanently remove the article from the database. This action cannot be undone."
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedVisible.length} article(s)?`}
        description="This permanently removes the selected articles from the database. This action cannot be undone."
        confirmLabel="Delete all"
        onConfirm={bulkDelete}
      />

      <Dialog open={!!viewsRow} onOpenChange={(open) => !open && !viewsBusy && setViewsRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage views</DialogTitle>
            <DialogDescription className="line-clamp-2">{viewsRow?.titleBn}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
              <span className="text-sm font-semibold">Current views</span>
              <span className="text-lg font-black tabular-nums">{(viewsRow?.views ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={viewsBusy} onClick={() => changeViews(1)}>
                <Plus className="h-4 w-4" /> Add 1
              </Button>
              <Button variant="outline" size="sm" disabled={viewsBusy} onClick={() => changeViews(100)}>
                <Plus className="h-4 w-4" /> Add 100
              </Button>
              <Button variant="outline" size="sm" disabled={viewsBusy} onClick={() => changeViews(-1)}>
                <Minus className="h-4 w-4" /> Remove 1
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="views-exact">Set exact count</Label>
              <div className="flex gap-2">
                <Input
                  id="views-exact"
                  type="number"
                  min={0}
                  value={viewsValue}
                  onChange={(e) => setViewsValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), saveViews())}
                />
                <Button onClick={saveViews} disabled={viewsBusy}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Counts can never go below zero.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setViewsRow(null)} disabled={viewsBusy}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
