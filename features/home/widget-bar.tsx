"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CloudSun,
  Sunrise,
  TrendingUp,
  TrendingDown,
  Coins,
  DollarSign,
  Bitcoin,
  ArrowRight,
} from "lucide-react";
import { weatherData, prayerTimes } from "@/constants/widgets";
import { stockMarket, goldPrices, currencyRates, cryptoPrices } from "@/constants/social";
import { useClock } from "@/hooks/use-clock";
import { localizedDigits } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

function getNextPrayer(now: Date) {
  const hm = now.getHours() * 60 + now.getMinutes();
  const parsed = prayerTimes.map((p) => {
    const parts = p.time.replace(/ AM| PM/, "").split(":").map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const isPM = p.time.includes("PM") && h !== 12;
    const hours = isPM ? h + 12 : h === 12 ? 0 : h;
    const minutes = hours * 60 + m;
    const diff = minutes - hm;
    return { ...p, diff };
  });
  const upcoming = parsed.filter((p) => p.diff > 0).sort((a, b) => a.diff - b.diff)[0];
  return upcoming ?? { ...parsed[0]!, diff: 1440 + parsed[0]!.diff };
}

export function WidgetBar() {
  const { lang } = useLanguage();
  const now = useClock(1000);
  const nextPrayer = now ? getNextPrayer(now) : undefined;
  const diffMins = nextPrayer?.diff ?? 0;
  const hh = Math.floor(diffMins / 60);
  const mm = diffMins % 60;
  const ss = now ? 60 - now.getSeconds() : 0;

  const widgetClass =
    "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-soft-lg";

  const TrendIcon = ({ up }: { up: boolean }) => (up ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-danger" />);

  return (
    <section className="container-page grid grid-cols-2 gap-4 pb-2 md:grid-cols-3 xl:grid-cols-5" aria-label={lang === "bn" ? "তথ্যসূচি" : "Reference data"}>
      <p className="col-span-full text-sm text-muted-foreground">{lang === "bn" ? "নমুনা তথ্য · সরাসরি আপডেট হয় না" : "Sample data · no live updates"}</p>
      <div className={widgetClass}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "bn" ? "আবহাওয়া" : "Weather"}
          </span>
          <CloudSun className="h-4 w-4 text-warning" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-bengali text-2xl font-bold text-foreground">
              {lang === "bn" ? localizedDigits(lang, weatherData[0]?.temp ?? 31) : weatherData[0]?.temp}°
            </p>
            <p className="text-[11px] text-muted-foreground">
              {lang === "bn" ? weatherData[0]?.conditionBn : weatherData[0]?.condition}
            </p>
          </div>
          <p className="font-bengali text-xs font-bold text-brand">{lang === "bn" ? "ঢাকা" : "Dhaka"}</p>
        </div>
      </div>

      <div className={widgetClass}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "bn" ? "নামাজ" : "Prayer"}
          </span>
          <Sunrise className="h-4 w-4 text-accentblue" />
        </div>
        <div className="mt-3">
          <p className="font-bengali text-sm font-bold">
            {nextPrayer ? (lang === "bn" ? nextPrayer.nameBn : nextPrayer.name) : lang === "bn" ? "নামাজ" : "Prayer"}
            <span className="ml-1 text-[10px] font-medium text-success">
              {nextPrayer ? (lang === "bn" ? `বাকি ${localizedDigits(lang, hh)}:${localizedDigits(lang, String(mm).padStart(2, "0"))}` : `${hh}:${String(mm).padStart(2, "0")} left`) : ""}
            </span>
          </p>
          <p className="font-mono text-2xl font-black text-brand">
            {now
              ? `${localizedDigits(lang, String(hh).padStart(2, "0"))}:${localizedDigits(lang, String(mm).padStart(2, "0"))}:${localizedDigits(lang, String(ss).padStart(2, "0"))}`
              : "--:--:--"}
          </p>
        </div>
      </div>

      <div className={widgetClass}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "bn" ? "শেয়ারবাজার" : "DSEX"}
          </span>
          <TrendIcon up={stockMarket[0]!.change > 0} />
        </div>
        <div className="mt-3">
          <p className="font-mono text-xl font-black text-foreground">
            {localizedDigits(lang, stockMarket[0]!.price.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
          </p>
          <p className={cn("text-xs font-bold", stockMarket[0]!.change > 0 ? "text-success" : "text-danger")}>
            {stockMarket[0]!.change > 0 ? "+" : ""}
            {localizedDigits(lang, stockMarket[0]!.change)} ({stockMarket[0]!.changePercent > 0 ? "+" : ""}
            {localizedDigits(lang, stockMarket[0]!.changePercent)}%)
          </p>
        </div>
      </div>

      <div className={widgetClass}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "bn" ? "সোনা" : "Gold"}
          </span>
          <Coins className="h-4 w-4 text-warning" />
        </div>
        <div className="mt-3">
          <p className="font-bengali text-xl font-black text-foreground">
            {lang === "bn" ? "৳" : "BDT"} {localizedDigits(lang, goldPrices[0]!.price.toLocaleString())}
          </p>
          <p className="text-xs font-bold text-success">+{localizedDigits(lang, goldPrices[0]!.changePercent)}%</p>
        </div>
      </div>

      <div className={widgetClass}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "bn" ? "মুদ্রা" : "Currency"}
          </span>
          <DollarSign className="h-4 w-4 text-success" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-mono text-xl font-black text-foreground">{localizedDigits(lang, currencyRates[0]!.price)}</p>
          <p className="text-[11px] text-muted-foreground">{lang === "bn" ? "ডলার" : "USD"}</p>
        </div>
      </div>

      <Link href="/markets" className={cn(widgetClass, "col-span-2 md:col-span-3 xl:col-span-5")}>
        <div className="flex items-center gap-6 overflow-hidden">
          {cryptoPrices.map((c) => (
            <motion.div key={c.symbol} className="flex items-center gap-2 text-xs" whileHover={{ scale: 1.05 }}>
              <Bitcoin className="h-4 w-4 text-warning" />
              <span className="font-bold">{lang === "bn" ? c.nameBn : c.symbol}</span>
              <span className="font-mono text-muted-foreground">{localizedDigits(lang, c.price.toLocaleString("en-US", { maximumFractionDigits: 2 }))}</span>
              <span className={c.changePercent > 0 ? "text-success" : "text-danger"}>{c.changePercent > 0 ? "+" : ""}{localizedDigits(lang, c.changePercent)}%</span>
            </motion.div>
          ))}
          <span className="ml-auto hidden items-center gap-1 text-xs font-bold text-brand sm:flex">
            {lang === "bn" ? "বাজার দেখুন" : "View markets"}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}
