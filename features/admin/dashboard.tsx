"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, PenSquare, UserPlus, MessageSquare, DollarSign, TrendingUp } from "lucide-react";
import { adminService } from "@/services/adminService";
import { StatCard } from "@/features/admin/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";

export function AdminDashboard() {
  const { lang } = useLanguage();
  const [stats, setStats] = React.useState<Awaited<ReturnType<typeof adminService.getStats>> | null>(null);
  const [chart, setChart] = React.useState<Awaited<ReturnType<typeof adminService.getChart>> | null>(null);

  React.useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getChart()]).then(([s, c]) => {
      setStats(s);
      setChart(c);
    });
  }, []);

  const quickActions = [
    { href: "/admin/news/new", icon: PenSquare, label: lang === "bn" ? "নতুন সংবাদ" : "Write News" },
    { href: "/admin/media", icon: Eye, label: lang === "bn" ? "মিডিয়া" : "Media" },
    { href: "/admin/newsletter", icon: UserPlus, label: lang === "bn" ? "নিউজলেটার" : "Newsletter" },
    { href: "/admin/analytics", icon: TrendingUp, label: lang === "bn" ? "অ্যানালিটিক্স" : "Analytics" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">
            {lang === "bn" ? "স্বাগতম, অ্যাডমিন!" : "Welcome back, Admin!"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "bn" ? "এখানে আপনার সাইটের লাইভ পরিসংখ্যান দেখুন।" : "Here's what's happening with your site today."}
          </p>
        </div>
        <Link href="/admin/news/new">
          <Button>
            <PenSquare className="h-4 w-4" />
            {lang === "bn" ? "নতুন সংবাদ লিখুন" : "Write News"}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats ? stats.map((s, i) => <StatCard key={s.key} stat={s} index={i} />) : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{lang === "bn" ? "ট্রাফিক ওভারভিউ" : "Traffic Overview"}</CardTitle>
            <CardDescription>{lang === "bn" ? "গত ৭ দিনের দর্শন" : "Last 7 days performance"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {chart ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E50914" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#E50914" strokeWidth={2.5} fill="url(#viewsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full rounded-xl" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "bn" ? "কুইক অ্যাকশন" : "Quick Actions"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((a, i) => (
              <motion.div key={a.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
                <Link
                  href={a.href}
                  className="flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition-all hover:border-brand hover:bg-brand/5"
                >
                  <span className="rounded-lg bg-brand/10 p-2 text-brand">
                    <a.icon className="h-4 w-4" />
                  </span>
                  {a.label}
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{lang === "bn" ? "প্রকাশিত সংবাদ" : "Articles Published"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {chart ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="articles" name="Articles" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full rounded-xl" />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: MessageSquare, label: lang === "bn" ? "মন্তব্য" : "Comments", value: "1,284" },
          { icon: DollarSign, label: lang === "bn" ? "বিজ্ঞাপন আয়" : "Ad Revenue", value: "৳84,500" },
          { icon: UserPlus, label: lang === "bn" ? "নতুন ব্যবহারকারী" : "New Users", value: "+320" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <span className="rounded-xl bg-accentblue/10 p-3 text-accentblue">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-black tabular-nums">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
