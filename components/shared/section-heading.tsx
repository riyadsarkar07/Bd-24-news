"use client";

import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

interface SectionHeadingProps {
  title: string;
  titleBn?: string;
  link?: string;
  icon?: React.ReactNode;
  color?: string;
  hot?: boolean;
  className?: string;
}

export function SectionHeading({ title, titleBn, link, icon, color = "#E50914", hot, className }: SectionHeadingProps) {
  const { t } = useLanguage();
  return (
    <div className={cn("section-title", className)}>
      <span className="section-title-bar" style={{ background: color, boxShadow: `0 0 24px ${color}55` }}>
        {icon}
        <span className="font-bengali">{titleBn ?? title}</span>
        {hot && <Flame className="h-4 w-4 animate-pulse" />}
      </span>
      <span className="section-title-line" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
      {link && (
        <Link
          href={link}
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-bold text-muted-foreground transition-colors hover:text-brand"
        >
          {t("viewAll")}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
