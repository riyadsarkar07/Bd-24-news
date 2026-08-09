import { getSupabase } from "@/lib/supabase/client";

export interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  draftArticles: number;
  totalUsers: number;
  totalSubscribers: number;
  totalComments: number;
  monthlyTrend: { label: string; views: number; articles: number }[];
  categoryDistribution: { name: string; value: number; color: string }[];
  topPages: { page: string; title: string; views: number }[];
  contentStatus: { name: string; value: number; color: string }[];
}

const EMPTY: AnalyticsData = {
  totalViews: 0,
  totalArticles: 0,
  draftArticles: 0,
  totalUsers: 0,
  totalSubscribers: 0,
  totalComments: 0,
  monthlyTrend: [],
  categoryDistribution: [],
  topPages: [],
  contentStatus: [],
};

type ArticleRow = { status?: string; views?: number; published_at?: string; category?: string; category_color?: string; slug?: string; title_bn?: string; title?: string };

export async function getAnalytics(): Promise<AnalyticsData> {
  const supabase = getSupabase();
  if (!supabase) return EMPTY;
  try {
    const { data: articles } = await supabase.from("articles").select("status,views,published_at,category,category_color,slug,title_bn,title");
    const { count: userCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const { count: subscriberCount } = await supabase.from("subscribers").select("id", { count: "exact", head: true });
    const { count: commentCount } = await supabase.from("comments").select("id", { count: "exact", head: true });

    const all = (articles ?? []) as ArticleRow[];
    const published = all.filter((d) => (d.status ?? "published") === "published");
    const drafts = all.filter((d) => d.status === "draft");
    const totalViews = published.reduce((sum, d) => sum + Number(d.views ?? 0), 0);

    const monthLabel = (d: Date) => d.toLocaleString("en-US", { month: "short" });
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const inMonth = published.filter((doc) => {
        const ts = new Date(doc.published_at ?? "");
        return !Number.isNaN(ts.getTime()) && ts >= d && ts < next;
      });
      return {
        label: monthLabel(d),
        views: inMonth.reduce((sum, doc) => sum + Number(doc.views ?? 0), 0),
        articles: inMonth.length,
      };
    });

    const categoryColors = new Map<string, string>();
    const categoryCounts = new Map<string, number>();
    published.forEach((d) => {
      const cat = d.category ?? "bangladesh";
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
      if (!categoryColors.has(cat)) categoryColors.set(cat, d.category_color ?? "#E50914");
    });
    const categoryDistribution = [...categoryCounts.entries()].map(([name, value]) => ({
      name,
      value,
      color: categoryColors.get(name) ?? "#E50914",
    }));

    const topPages = [...published]
      .sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0))
      .slice(0, 5)
      .map((d) => ({
        page: `/article/${d.slug ?? d.title_bn ?? ""}`,
        title: d.title_bn || d.title || "",
        views: Number(d.views ?? 0),
      }));

    const contentStatus = [
      { name: "Published", value: published.length, color: "#22C55E" },
      { name: "Draft", value: drafts.length, color: "#64748B" },
    ];

    return {
      totalViews,
      totalArticles: published.length,
      draftArticles: drafts.length,
      totalUsers: userCount ?? 0,
      totalSubscribers: subscriberCount ?? 0,
      totalComments: commentCount ?? 0,
      monthlyTrend: monthly,
      categoryDistribution,
      topPages,
      contentStatus,
    };
  } catch (err) {
    console.error("Failed to load analytics:", err);
    return EMPTY;
  }
}
