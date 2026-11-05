"use client";

import * as React from "react";
import Link from "next/link";
import { Check, X, ChevronDown, ChevronUp, MoreHorizontal, AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Toolbar({
  search,
  onSearch,
  placeholder,
  actions,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder ?? "Search…"}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export interface AdminColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

function detailEntries(row: object): [string, string][] {
  return Object.entries(row)
    .filter(([k, v]) => k !== "id" && typeof v === "string" && v.length > 40)
    .slice(0, 3)
    .map(([k, v]) => [k, String(v)]);
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  actions,
  onDelete,
  emptyTitle,
  emptyDescription,
  emptyAction,
  selection,
}: {
  columns: AdminColumn<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  onDelete?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  selection?: {
    selected: string[];
    onChange: (ids: string[]) => void;
  };
}) {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const canExpand = React.useCallback((row: T) => detailEntries(row).length > 0, []);
  const showActions = Boolean(actions || onDelete);
  const selectedSet = React.useMemo(() => new Set(selection?.selected ?? []), [selection?.selected]);
  const allSelected = Boolean(selection && data.length > 0 && data.every((r) => selectedSet.has(r.id)));

  function toggleRow(id: string) {
    if (!selection) return;
    selection.onChange(
      selectedSet.has(id) ? selection.selected.filter((x) => x !== id) : [...selection.selected, id],
    );
  }

  function toggleAll() {
    if (!selection) return;
    selection.onChange(allSelected ? [] : data.map((r) => r.id));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {selection && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    className="h-4 w-4 rounded border-border accent-brand"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground", c.className)}>
                  {c.header}
                </th>
              ))}
              {showActions && (
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-muted-foreground">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const expandable = canExpand(row);
              const isSelected = selectedSet.has(row.id);
              return (
                <React.Fragment key={row.id}>
                  <tr className={cn("border-b transition-colors last:border-0 hover:bg-muted/30", isSelected ? "bg-brand/5" : i % 2 === 1 && "bg-muted/20")}>
                    {selection && (
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Select row"
                          className="h-4 w-4 rounded border-border accent-brand"
                          checked={isSelected}
                          onChange={() => toggleRow(row.id)}
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                        {c.render(row)}
                      </td>
                    ))}
                    {showActions && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions?.(row)}
                          {(expandable || onDelete) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {expandable && (
                                  <DropdownMenuItem onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                                    {expanded === row.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {expanded === row.id ? "Collapse" : "Expand"}
                                  </DropdownMenuItem>
                                )}
                                {onDelete && (
                                  <>
                                    {expandable && <DropdownMenuSeparator />}
                                    <DropdownMenuItem className="text-danger" onClick={() => onDelete(row)}>
                                      <X className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandable && expanded === row.id && (
                    <tr className="border-b bg-muted/30 last:border-0">
                      <td colSpan={columns.length + (showActions ? 1 : 0) + (selection ? 1 : 0)} className="px-4 py-4 text-xs leading-relaxed text-muted-foreground">
                        {detailEntries(row).map(([k, v]) => (
                          <p key={k} className="mb-1.5">
                            <span className="font-bold text-foreground">{k}:</span> {v.slice(0, 160)}
                          </p>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm font-semibold text-foreground">{emptyTitle ?? "No results found"}</p>
          {emptyDescription && <p className="max-w-sm text-xs">{emptyDescription}</p>}
          {emptyAction && <div className="mt-2">{emptyAction}</div>}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: "published" | "draft" | "pending" | "active" | "inactive" | "spam" | "deleted" | "banned" }) {
  const styles: Record<string, string> = {
    published: "bg-success/15 text-success",
    active: "bg-success/15 text-success",
    draft: "bg-muted text-muted-foreground",
    pending: "bg-warning/15 text-warning",
    inactive: "bg-muted text-muted-foreground",
    spam: "bg-danger/15 text-danger",
    deleted: "bg-danger/15 text-danger",
    banned: "bg-danger/15 text-danger",
  };
  return <Badge variant="outline" className={cn("border-0 capitalize", styles[status])}>{status}</Badge>;
}

export function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
      <Check className="h-3 w-3" />
    </span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <X className="h-3 w-3" />
    </span>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel,
  destructive = true,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  const [busy, setBusy] = React.useState(false);

  async function handleConfirm() {
    try {
      setBusy(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={handleConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("font-semibold transition-colors hover:text-brand", className)}>
      {children}
    </Link>
  );
}
