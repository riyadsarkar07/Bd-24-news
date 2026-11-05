import { getSupabase } from "@/lib/supabase/client";

export type AnalyticsRange = "7d" | "30d" | "90d";

export interface TrendPoint {
  label: string;
  views: number;
  articles: number;
}

export interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  draftArticles: number;
  totalUsers: number;
  totalSubscribers: number;
  totalComments: number;
  monthlyTrend: TrendPoint[];
  categoryDistribution: { name: string; value: number; color: string }[];
  topPages: { page: string; title: string; views: number }[];
  contentStatus: { name: string; value: number; color: string }[];
  deltas: {
    views: number;
    articles: number;
    users: number;
    subscribers: number;
    comments: number;
  };
}


type ArticleRow = {
  status?: string;
  views?: number;
  published_at?: string;
  category?: string;
  category_color?: string;
  slug?: string;
  title_bn?: string;
  title?: string;
};

type DatedRow = { at?: string };

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_DAYS: Record<AnalyticsRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

/** Percentage change from `previous` to `current`, rounded to one decimal. */
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function parseTime(value: unknown): number | null {
  if (typeof value !== "string" || !value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

function countInWindow(rows: DatedRow[], from: number, to: number): number {
  return rows.reduce((sum, row) => {
    const t = parseTime(row.at);
    return t !== null && t >= from && t < to ? sum + 1 : sum;
  }, 0);
}

/** Builds range-appropriate trend buckets ending at `now`. */
function buildTrend(published: ArticleRow[], range: AnalyticsRange, now: number): TrendPoint[] {
  const days = RANGE_DAYS[range];
  const buckets = range === "7d" ? 7 : range === "30d" ? 10 : 13;
  const span = (days * DAY_MS) / buckets;
  const dayLabel = (d: Date) =>
    range === "7d"
      ? d.toLocaleString("en-US", { weekday: "short" })
      : d.toLocaleString("en-US", { month: "short", day: "numeric" });

  return Array.from({ length: buckets }, (_, i) => {
    const from = now - (buckets - i) * span;
    const to = now - (buckets - i - 1) * span;
    const inBucket = published.filter((doc) => {
      const t = parseTime(doc.published_at);
      return t !== null && t >= from && t < to;
    });
    const start = new Date(from);
    return {
      label: dayLabel(start),
      views: inBucket.reduce((sum, doc) => sum + Number(doc.views ?? 0), 0),
      articles: inBucket.length,
    };
  });
}

export async function getAnalytics(range: AnalyticsRange = "30d"): Promise<AnalyticsData> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  try {
    const [articlesRes, profilesRes, subscriberRes, commentRes] = await Promise.all([
      supabase
        .from("articles")
        .select("status,views,published_at,category,category_color,slug,title_bn,title"),
      supabase.from("profiles").select("id,joined_at"),
      supabase.from("subscribers").select("id,subscribed_at"),
      supabase.from("comments").select("id,created_at"),
    ]);

    if (articlesRes.error) console.error("Analytics articles read failed:", articlesRes.error.message);

    const articles = (articlesRes.data ?? []) as ArticleRow[];
    const profiles = ((profilesRes.data ?? []) as { joined_at?: string }[]).map((r) => ({ at: r.joined_at }));
    const subscribers = ((subscriberRes.data ?? []) as { subscribed_at?: string }[]).map((r) => ({ at: r.subscribed_at }));
    const comments = ((commentRes.data ?? []) as { created_at?: string }[]).map((r) => ({ at: r.created_at }));

    const published = articles.filter((d) => (d.status ?? "published") === "published");
    const drafts = articles.filter((d) => d.status === "draft");
    const totalViews = published.reduce((sum, d) => sum + Number(d.views ?? 0), 0);

    const now = Date.now();
    const windowMs = RANGE_DAYS[range] * DAY_MS;
    const currentFrom = now - windowMs;
    const previousFrom = now - windowMs * 2;

    const publishedWithDated = published.map((d) => ({ ...d, at: d.published_at }));
    const articlesCurrent = countInWindow(publishedWithDated, currentFrom, now);
    const articlesPrevious = countInWindow(publishedWithDated, previousFrom, currentFrom);

    const viewsCurrent = published.reduce((sum, d) => {
      const t = parseTime(d.published_at);
      return t !== null && t >= currentFrom && t <= now ? sum + Number(d.views ?? 0) : sum;
    }, 0);
    const viewsPrevious = published.reduce((sum, d) => {
      const t = parseTime(d.published_at);
      return t !== null && t >= previousFrom && t < currentFrom ? sum + Number(d.views ?? 0) : sum;
    }, 0);

    const usersCurrent = countInWindow(profiles, currentFrom, now);
    const usersPrevious = countInWindow(profiles, previousFrom, currentFrom);
    const subsCurrent = countInWindow(subscribers, currentFrom, now);
    const subsPrevious = countInWindow(subscribers, previousFrom, currentFrom);
    const commentsCurrent = countInWindow(comments, currentFrom, now);
    const commentsPrevious = countInWindow(comments, previousFrom, currentFrom);

    const categoryColors = new Map<string, string>();
    const categoryCounts = new Map<string, number>();
    published.forEach((d) => {
      const cat = d.category ?? "bangladesh";
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
      if (!categoryColors.has(cat)) categoryColors.set(cat, d.category_color ?? "#E50914");
    });
    const categoryDistribution = [...categoryCounts.entries()]
      .map(([name, value]) => ({
        name,
        value,
        color: categoryColors.get(name) ?? "#E50914",
      }))
      .sort((a, b) => b.value - a.value);

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
      totalUsers: profiles.length,
      totalSubscribers: subscribers.length,
      totalComments: comments.length,
      monthlyTrend: buildTrend(published, range, now),
      categoryDistribution,
      topPages,
      contentStatus,
      deltas: {
        views: percentChange(viewsCurrent, viewsPrevious),
        articles: percentChange(articlesCurrent, articlesPrevious),
        users: percentChange(usersCurrent, usersPrevious),
        subscribers: percentChange(subsCurrent, subsPrevious),
        comments: percentChange(commentsCurrent, commentsPrevious),
      },
    };
  } catch (err) {
    console.error("Failed to load analytics:", err);
    throw err instanceof Error ? err : new Error("Failed to load analytics");
  }
}
