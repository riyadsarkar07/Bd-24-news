"use client";

import * as React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/providers/language-provider";

const traffic = [
  { month: "Feb", views: 1.2, users: 0.8 },
  { month: "Mar", views: 1.6, users: 1.0 },
  { month: "Apr", views: 1.4, users: 0.9 },
  { month: "May", views: 2.1, users: 1.3 },
  { month: "Jun", views: 1.9, users: 1.2 },
  { month: "Jul", views: 2.6, users: 1.6 },
  { month: "Aug", views: 2.8, users: 1.8 },
];

const sources = [
  { name: "Direct", value: 38, color: "#E50914" },
  { name: "Google", value: 27, color: "#2563EB" },
  { name: "Social", value: 21, color: "#22C55E" },
  { name: "Referral", value: 14, color: "#F59E0B" },
];

const topPages = [
  { page: "/", title: "Homepage", views: 421000, bounce: 41 },
  { page: "/category/bangladesh", title: "Bangladesh", views: 214000, bounce: 38 },
  { page: "/category/sports", title: "Sports", views: 176000, bounce: 35 },
  { page: "/article/cricket-world-cup-2026", title: "Cricket World Cup 2026", views: 138000, bounce: 52 },
  { page: "/markets", title: "Markets", views: 96000, bounce: 29 },
];

export function AnalyticsManager() {
  const { lang } = useLanguage();
  const [range, setRange] = React.useState("30d");

  return (
    <div className="space-y-6">
      <PageHeader
        title={lang === "bn" ? "অ্যানালিটিক্স" : "Analytics"}
        description="Site traffic and engagement insights"
        action={
          <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold uppercase transition-all ${range === r ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: lang === "bn" ? "মোট দর্শন" : "Page views", value: "2.84M", delta: "+12.4%" },
          { label: lang === "bn" ? "ইউনিক ভিজিটর" : "Visitors", value: "412K", delta: "+8.1%" },
          { label: lang === "bn" ? "বাউন্স রেট" : "Bounce rate", value: "44.2%", delta: "-2.3%" },
          { label: lang === "bn" ? "গড় সেশন" : "Avg session", value: "3m 42s", delta: "+5.7%" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-2xl font-black tabular-nums">{s.value}</p>
                <p className={s.delta.startsWith("-") ? "text-xs font-semibold text-success" : "text-xs font-semibold text-success"}>{s.delta} vs last period</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{lang === "bn" ? "ট্রাফিক ট্রেন্ড" : "Traffic Trend"}</CardTitle>
            <CardDescription>Monthly views (millions)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={traffic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E50914" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="usersGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="views" name="Views" stroke="#E50914" strokeWidth={2.5} fill="url(#viewsGrad2)" />
                  <Area type="monotone" dataKey="users" name="Users" stroke="#2563EB" strokeWidth={2.5} fill="url(#usersGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "bn" ? "ট্রাফিক সোর্স" : "Traffic Sources"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sources} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="hsl(var(--card))">
                    {sources.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5">
              {sources.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="font-semibold">{s.name}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{lang === "bn" ? "সেরা পেজ" : "Top Pages"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPages.map((p, i) => (
              <div key={p.page} className="flex items-center gap-3">
                <span className="w-6 text-sm font-black tabular-nums text-muted-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.page}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black tabular-nums">{p.views.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{p.bounce}% bounce</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "bn" ? "ডিভাইস ও প্ল্যাটফর্ম" : "Devices & Platforms"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "Mobile", value: 68, color: "#E50914" }, { name: "Desktop", value: 26, color: "#2563EB" }, { name: "Tablet", value: 6, color: "#22C55E" }]} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={60} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v) => [`${v}%`]} />
                  <Bar dataKey="value" name="Share" radius={[0, 8, 8, 0]} barSize={28}>
                    {[{ name: "Mobile", value: 68, color: "#E50914" }, { name: "Desktop", value: 26, color: "#2563EB" }, { name: "Tablet", value: 6, color: "#22C55E" }].map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
