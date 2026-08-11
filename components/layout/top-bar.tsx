"use client";

import Link from "next/link";
import { CalendarDays, CloudSun, Languages, Moon } from "lucide-react";
import { format } from "date-fns";
import { useClock } from "@/hooks/use-clock";
import { useLanguage } from "@/providers/language-provider";
import { useTheme } from "next-themes";
import { SocialLinks } from "@/components/shared/social-icons";
import { weatherData } from "@/constants/widgets";
import { toBanglaNumerals } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const now = useClock();
  const { lang, toggle } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();

  const dateStr =
    now == null
      ? ""
      : lang === "bn"
        ? toBanglaNumerals(format(now, "eeee, d MMMM yyyy"))
        : format(now, "EEEE, do MMMM yyyy");
  const timeStr =
    now == null ? "" : lang === "bn" ? toBanglaNumerals(format(now, "h:mm:ss a")) : format(now, "h:mm:ss a");

  return (
    <div className="hidden border-b border-border/50 bg-navy-950 text-white lg:block">
      <div className="container-page flex h-10 items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <SocialLinks size="sm" className="[&_a]:border-white/10 [&_a]:bg-white/5 [&_a]:text-white/70" />
          <span className="hidden items-center gap-1.5 text-white/70 xl:flex">
            <CalendarDays className="h-3.5 w-3.5 text-brand-400" />
            {dateStr}
          </span>
          <span className="hidden items-center gap-1.5 font-mono text-white/70 md:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            {timeStr} GMT+6
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/weather"
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloudSun className="h-3.5 w-3.5 text-warning" />
            ঢাকা {toBanglaNumerals(weatherData[0]?.temp ?? 31)}°C
          </Link>
          <span className="h-3 w-px bg-white/15" />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="gap-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "bn" ? "English" : "বাংলা"}
          </Button>
          <span className="h-3 w-px bg-white/15" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Toggle theme"
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
