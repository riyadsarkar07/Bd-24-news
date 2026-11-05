"use client";

import * as React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { getAnalytics, type AnalyticsData, type AnalyticsRange } from "@/services/analyticsService";
import { cn } from "@/lib/utils";

const RANGE_LABEL: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function Delta({ value }: { value: number }) {
  const flat = value === 0;
  const up = value > 0;
  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-1 text-xs font-semibold",
        flat ? "text-muted-foreground" : up ? "text-success" : "text-danger",
      )}
    >
      {!flat && (up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
      {value > 0 ? "+" : ""}
      {value}% vs last period
    </p>
  );
}

export function AnalyticsManager() {
  const { lang } = useLanguage();
  const [range, setRange] = React.useState<AnalyticsRange>("30d");
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getAnalytics(range)
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const trend = data?.monthlyTrend ?? [];
  const categories = data?.categoryDistribution ?? [];
  const topPages = data?.topPages ?? [];
  const status = data?.contentStatus ?? [];

  const statCards = [
    { label: lang === "bn" ? "মোট দর্শন" : "Page views", value: data ? data.totalViews.toLocaleString() : "—", delta: data?.deltas.views ?? 0 },
    { label: lang === "bn" ? "মোট সংবাদ" : "Articles", value: data ? data.totalArticles.toLocaleString() : "—", delta: data?.deltas.articles ?? 0 },
    { label: lang === "bn" ? "সাবস্ক্রাইবার" : "Subscribers", value: data ? data.totalSubscribers.toLocaleString() : "—", delta: data?.deltas.subscribers ?? 0 },
    { label: lang === "bn" ? "মন্তব্য" : "Comments", value: data ? data.totalComments.toLocaleString() : "—", delta: data?.deltas.comments ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={lang === "bn" ? "অ্যানালিটিক্স" : "Analytics"}
        description={lang === "bn" ? "সাইট ট্রাফিক ও এনগেজমেন্ট" : "Site traffic and engagement insights"}
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

      {failed && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <span className="flex-1">
            {lang === "bn" ? "অ্যানালিটিক্স লোড করা যায়নি।" : "Could not load analytics."}
          </span>
          <Button size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
            {lang === "bn" ? "আবার চেষ্টা" : "Retry"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : statCards.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{s.value}</p>
                  <Delta value={s.delta} />
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{lang === "bn" ? "ট্রাফিক ট্রেন্ড" : "Traffic Trend"}</CardTitle>
            <CardDescription>{RANGE_LABEL[range]} — views and published articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {loading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#E50914" strokeWidth={2.5} fill="url(#viewsGrad2)" />
                    <Area type="monotone" dataKey="articles" name="Articles" stroke="#2563EB" strokeWidth={2.5} fill="url(#usersGrad2)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {lang === "bn" ? "কোনো তথ্য নেই" : "No data in this range"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "bn" ? "বিভাগ" : "Category Distribution"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="hsl(var(--card))">
                      {categories.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{lang === "bn" ? "কোনো তথ্য নেই" : "No data yet"}</div>
              )}
            </div>
            <div className="mt-2 space-y-1.5">
              {categories.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="font-semibold">{s.name}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
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
            {topPages.length > 0 ? topPages.map((p, i) => (
              <div key={p.page} className="flex items-center gap-3">
                <span className="w-6 text-sm font-black tabular-nums text-muted-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.page}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black tabular-nums">{p.views.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">views</p>
                </div>
              </div>
            )) : (
              <p className="py-8 text-center text-sm text-muted-foreground">{lang === "bn" ? "কোনো তথ্য নেই" : "No data yet"}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "bn" ? "কন্টেন্ট স্ট্যাটাস" : "Content Status"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {status.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={status} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v) => [v, "Articles"]} />
                    <Bar dataKey="value" name="Articles" radius={[0, 8, 8, 0]} barSize={28}>
                      {status.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{lang === "bn" ? "কোনো তথ্য নেই" : "No data yet"}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
