"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CollectionError({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm">
      <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
      <span className="text-muted-foreground">
        {message ?? "Could not load data. Retrying automatically…"}
      </span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}
