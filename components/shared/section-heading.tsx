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
  const { t, lang } = useLanguage();
  const label = lang === "bn" ? (titleBn ?? title) : title;
  return (
    <div className={cn("section-title", className)}>
      <span
        className="section-title-bar relative overflow-hidden"
        style={{ background: color, boxShadow: `0 6px 22px -6px ${color}88` }}
      >
        <span className="relative flex items-center gap-2">
          {icon}
          <span className="font-bengali">{label}</span>
          {hot && <Flame className="h-4 w-4 animate-pulse text-white" />}
        </span>
      </span>
      <span className="section-title-line" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
      {link && (
        <Link
          href={link}
          className="group inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-xs font-bold text-muted-foreground transition-colors hover:text-brand"
        >
          {t("viewAll")}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
