"use client";

import * as React from "react";
import Link from "next/link";
import { Check, X, ChevronDown, ChevronUp, MoreHorizontal, AlertTriangle } from "lucide-react";
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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
      <Input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className="max-w-xs"
      />
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

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  actions,
  onDelete,
}: {
  columns: AdminColumn<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  onDelete?: (row: T) => void;
}) {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground", c.className)}>
                  {c.header}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <React.Fragment key={row.id}>
                <tr className={cn("border-b last:border-0", i % 2 === 1 && "bg-muted/20")}>
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions?.(row)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                          >
                            {expanded === row.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {expanded === row.id ? "Collapse" : "Expand"}
                          </DropdownMenuItem>
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-danger" onClick={() => onDelete(row)}>
                                <X className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr className="border-b bg-muted/30 last:border-0">
                    <td colSpan={columns.length + 1} className="px-4 py-4 text-xs leading-relaxed text-muted-foreground">
                      {Object.entries(row)
                        .filter(([k, v]) => !["id"].includes(k) && typeof v === "string" && v.length > 40)
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <p key={k} className="mb-1.5">
                            <span className="font-bold text-foreground">{k}:</span> {String(v).slice(0, 160)}
                          </p>
                        ))}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm font-semibold">No results found</p>
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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>
            Confirm
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
