"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Radio, Signal, Tv, Bell, MonitorPlay } from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { toBanglaNumerals } from "@/lib/utils";

const channels = [
  { id: 1, name: "BD24 News", nameBn: "বিডি২৪ নিউজ", category: "News", color: "#E50914", live: true, viewers: 48200 },
  { id: 2, name: "BD24 Sports", nameBn: "বিডি২৪ স্পোর্টস", category: "Sports", color: "#22C55E", live: true, viewers: 23100 },
  { id: 3, name: "BD24 Business", nameBn: "বিডি২৪ বিজনেস", category: "Business", color: "#059669", live: false, viewers: 8200 },
  { id: 4, name: "BD24 Entertainment", nameBn: "বিডি২৪ বিনোদন", category: "Entertainment", color: "#F59E0B", live: true, viewers: 15400 },
  { id: 5, name: "BD24 Music", nameBn: "বিডি২৪ মিউজিক", category: "Music", color: "#EC4899", live: false, viewers: 6100 },
  { id: 6, name: "BD24 Kids", nameBn: "বিডি২৪ কিডস", category: "Kids", color: "#0EA5E9", live: false, viewers: 4400 },
];

const schedule = [
  { time: "12:00", program: "সকালের খবর" },
  { time: "13:00", program: "বাজার পর্যালোচনা" },
  { time: "14:30", program: "মধ্যাহ্ন সংবাদ" },
  { time: "16:00", program: "ক্রীড়া ডাইজেস্ট" },
  { time: "18:00", program: "সন্ধ্যা সংবাদ" },
  { time: "20:30", program: "প্রাইম টাইম" },
];

export function LiveTvPage() {
  const { lang } = useLanguage();
  const [activeChannel, setActiveChannel] = React.useState(channels[0]!);

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "লাইভ টিভি" : "Live TV" }]} />
      <div className="mt-4">
        <SectionHeading title="Live TV" titleBn="লাইভ টিভি" color="#DC2626" icon={<Radio className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-black shadow-soft-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channels.find((c) => c.id === 1)?.id ? "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1280&q=80" : ""}
              alt="Live TV"
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-glow">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-white" />
                </span>
                LIVE
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                <Tv className="h-3.5 w-3.5" />
                {activeChannel.nameBn}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5">
              <div>
                <p className="font-bengali text-xl font-bold text-white">{lang === "bn" ? "সকালের খবর" : "Morning News"}</p>
                <p className="mt-1 text-xs text-white/60">
                  {lang === "bn" ? "দেখছেন" : "Watching"}: {toBanglaNumerals(activeChannel.viewers)} {lang === "bn" ? "জন" : "viewers"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-white/20 bg-white/10 text-white hover:text-white">
                  <Bell className="h-4 w-4" />
                  {lang === "bn" ? "রিমাইন্ডার" : "Remind"}
                </Button>
                <Button size="sm" className="bg-white text-navy-950 hover:bg-white/90">
                  <MonitorPlay className="h-4 w-4" />
                  {lang === "bn" ? "ফুল স্ক্রিন" : "Fullscreen"}
                </Button>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand/90 text-white shadow-glow">
                <span className="absolute inset-0 rounded-full bg-brand animate-pulse-ring" />
                <Radio className="h-8 w-8" />
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <h3 className="mb-4 flex items-center gap-2 font-bengali text-lg font-bold">
              <Signal className="h-4 w-4 text-brand" />
              {lang === "bn" ? "আজকের অনুষ্ঠানসূচি" : "Today's Schedule"}
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {schedule.map((s) => (
                <div key={s.time} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                  <span className="rounded-lg bg-brand px-2 py-1 font-mono text-xs font-bold text-white">{s.time}</span>
                  <span className="text-sm font-semibold">{s.program}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <h3 className="mb-4 font-bengali text-lg font-bold">{lang === "bn" ? "চ্যানেলসমূহ" : "Channels"}</h3>
            <div className="space-y-2">
              {channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannel(c)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    activeChannel.id === c.id
                      ? "border-brand bg-brand/5 shadow-glow"
                      : "border-border/60 hover:border-brand/40 hover:bg-muted/50",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: c.color }}>
                    <Tv className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{c.nameBn}</span>
                    <span className="text-[11px] text-muted-foreground">{c.category}</span>
                  </span>
                  {c.live && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-danger">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
                      Live
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-700 p-5 text-white shadow-glow">
            <p className="font-bengali text-lg font-bold">{lang === "bn" ? "ব্রেকিং নিউজ অ্যালার্ট" : "Breaking News Alerts"}</p>
            <p className="mt-1 text-xs text-white/70">
              {lang === "bn" ? "গুরুত্বপূর্ণ খবর আসা মাত্রই নোটিফিকেশন পান" : "Get notified the moment news breaks"}
            </p>
            <Button className="mt-4 w-full bg-white text-brand hover:bg-white/90">
              <Bell className="h-4 w-4" />
              {lang === "bn" ? "নোটিফিকেশন চালু করুন" : "Enable notifications"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
