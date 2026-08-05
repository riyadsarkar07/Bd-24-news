"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sunrise } from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { prayerTimes } from "@/constants/widgets";
import { useLanguage } from "@/providers/language-provider";
import { toBanglaNumerals } from "@/lib/utils";
import { useClock } from "@/hooks/use-clock";
import { cn } from "@/lib/utils";

export function PrayerPage() {
  const { lang } = useLanguage();
  const now = useClock(1000);

  const timeToMinutes = (t: string) => {
    const match = t.match(/^(\d+):(\d+)\s*(AM|PM)$/);
    if (!match) return 0;
    let h = Number(match[1]);
    const m = Number(match[2]);
    const period = match[3];
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  const currentMin = now.getHours() * 60 + now.getMinutes();
  const next = prayerTimes.find((p) => timeToMinutes(p.time) > currentMin);

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "নামাজের সময়সূচি" : "Prayer Times" }]} />
      <div className="mt-4">
        <SectionHeading title="Prayer Times" titleBn="নামাজের সময়সূচি" color="#16A34A" icon={<Sunrise className="h-4 w-4" />} />
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-emerald-950 p-8 text-white shadow-soft-lg">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-[90px]" />
        <div className="relative flex flex-col items-center gap-2 text-center">
          <p className="font-bengali text-lg font-bold text-emerald-300">{lang === "bn" ? "পরবর্তী নামাজ" : "Next Prayer"}</p>
          <p className="font-bengali text-5xl font-black">{next?.nameBn}</p>
          <p className="font-mono text-4xl font-black text-emerald-400">{next?.time}</p>
          <p className="text-sm text-white/50">
            {lang === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"} · {toBanglaNumerals(now.getDate())}-{toBanglaNumerals(now.getMonth() + 1)}-{toBanglaNumerals(now.getFullYear())}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prayerTimes.map((p, i) => {
          const isNext = p.nameBn === next?.nameBn;
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-5 shadow-card transition-all hover:-translate-y-1",
                isNext ? "border-emerald-500 bg-emerald-500/10 shadow-glow" : "border-border/60 bg-card",
              )}
            >
              {isNext && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Next
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{p.name}</p>
              <p className="mt-1 font-bengali text-2xl font-black">{p.nameBn}</p>
              <p className="font-mono text-xl font-bold text-brand">{p.time}</p>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {lang === "bn" ? "সময়গুলো ইসলামিক ফাউন্ডেশন, বাংলাদেশের সময়সূচি অনুযায়ী।" : "Times follow the schedule of Islamic Foundation, Bangladesh."}
      </p>
    </div>
  );
}
