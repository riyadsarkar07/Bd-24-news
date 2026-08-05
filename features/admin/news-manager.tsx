"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Copy, Search, LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";
import { articles } from "@/data/articles";
import { PageHeader, Toolbar, AdminTable, StatusBadge, ConfirmDialog, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import toast from "react-hot-toast";
import type { Article } from "@/types";

type ArticleRow = Pick<Article, "id" | "slug" | "title" | "titleBn" | "category" | "authorAvatar" | "author" | "publishedAt" | "views" | "featured" | "breaking"> & { status: "published" | "draft" };

const statuses: Record<string, ArticleRow["status"]> = {
  "constitutional-issues": "draft",
  "flood-forecast": "draft",
};

const rows: ArticleRow[] = articles.slice(0, 40).map((a) => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  titleBn: a.titleBn,
  category: a.category,
  authorAvatar: a.authorAvatar,
  author: a.author,
  publishedAt: a.publishedAt,
  views: a.views,
  featured: a.featured,
  breaking: a.breaking,
  status: statuses[a.slug] ?? "published",
}));

export function NewsManager() {
  const [data, setData] = React.useState<ArticleRow[]>(rows);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "published" | "draft">("all");
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [deleting, setDeleting] = React.useState<ArticleRow | null>(null);

  const filtered = data.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (r.title.toLowerCase().includes(search.toLowerCase()) || r.titleBn.toLowerCase().includes(search.toLowerCase())),
  );

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
      render: (r) => <span className="tabular-nums">{r.views.toLocaleString()}</span>,
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.publishedAt).toLocaleDateString()}</span>,
    },
  ];

  const handleDelete = () => {
    if (!deleting) return;
    setData((d) => d.filter((x) => x.id !== deleting.id));
    toast.success("Article deleted");
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
            <span className="font-semibold text-foreground">{r.views.toLocaleString()} views</span>
            <span>{new Date(r.publishedAt).toLocaleDateString()}</span>
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

      {view === "table" ? (
        <AdminTable
          columns={columns}
          data={filtered}
          onDelete={(r) => setDeleting(r)}
          actions={(r) => (
            <>
              <Link href={`/admin/news/edit/${r.id}`}>
                <Button variant="ghost" size="icon-sm" aria-label="Edit">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon-sm" aria-label="Duplicate" onClick={() => toast.success("Duplicated")}>
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
        description="This will permanently remove the article. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
