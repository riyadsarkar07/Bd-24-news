"use client";

import { Bell, Flame, TrendingUp, Trophy, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

const notifications = [
  { icon: Zap, color: "#E50914", title: "ব্রেকিং: মেট্রোরেল নতুন রুটে চালু", time: "২ মিনিট আগে" },
  { icon: Trophy, color: "#22C55E", title: "বিপিএল ফাইনালে বরিশালের জয়", time: "১৫ মিনিট আগে" },
  { icon: TrendingUp, color: "#2563EB", title: "সোনার দামে নতুন রেকর্ড", time: "১ ঘণ্টা আগে" },
  { icon: Flame, color: "#F59E0B", title: "টাইগারদের বিশ্বকাপ বাছাই আজ", time: "২ ঘণ্টা আগে" },
];

export function NotificationsDropdown() {
  const { lang } = useLanguage();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-black text-white">
            4
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <p className="font-bengali text-sm font-bold">{lang === "bn" ? "নোটিফিকেশন" : "Notifications"}</p>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">4 নতুন</span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.map((n, i) => (
            <button
              key={i}
              className="flex w-full items-start gap-3 border-b border-border/50 p-3 text-left transition-colors last:border-0 hover:bg-muted/50"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: n.color }}>
                <n.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-snug">{n.title}</span>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
              </span>
            </button>
          ))}
        </div>
        <button className="w-full p-3 text-center text-xs font-bold text-brand transition-colors hover:bg-brand/5">
          {lang === "bn" ? "সব দেখুন" : "View all"}
        </button>
      </PopoverContent>
    </Popover>
  );
}
