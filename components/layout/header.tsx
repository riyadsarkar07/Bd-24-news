"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Radio, Menu, UserRound, Newspaper } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { useSearchDialog } from "@/providers/search-provider";
import { useLanguage } from "@/providers/language-provider";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { setOpen } = useSearchDialog();
  const { t } = useLanguage();
  const { scrolled } = useScroll();
  const reduce = useReducedMotion();

  return (
    <motion.header
      initial={{ y: reduce ? 0 : -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-nav relative z-40 transition-all duration-300",
        scrolled ? "shadow-soft-lg" : "shadow-none",
      )}
    >
      <div className="container-page flex h-[76px] items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <Logo />

        <div className="hidden flex-1 items-center justify-center px-4 lg:flex">
          <button
            onClick={() => setOpen(true)}
            className="group flex w-full max-w-xl items-center gap-3 rounded-full border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-brand/40 hover:bg-muted/70"
          >
            <Search className="h-4 w-4 transition-colors group-hover:text-brand" />
            <span>{t("search")}…</span>
            <kbd className="ml-auto rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              /
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/live-tv">
            <Button
              variant="gradient"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <Radio className="h-4 w-4" />
              {t("watchLive")}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
          >
            <Newspaper className="h-4 w-4" />
            {t("subscribe")}
          </Button>
          <NotificationsDropdown />
          <ThemeToggle />
          <Link href="/login" aria-label="Account">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <UserRound className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
