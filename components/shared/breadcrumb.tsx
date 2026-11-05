"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <Link href="/" className="flex shrink-0 items-center gap-1 transition-colors hover:text-brand">
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          {item.href ? (
            <Link href={item.href} className="shrink-0 transition-colors hover:text-brand">
              {item.label}
            </Link>
          ) : (
            <span className="shrink-0 truncate text-foreground/80" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
