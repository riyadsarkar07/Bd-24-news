import { getFirebaseDb } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";

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

export async function getAnalytics(): Promise<AnalyticsData> {
  const db = getFirebaseDb();
  if (!db) return EMPTY;
  try {
    const [articleSnap, userSnap, subscriberSnap, commentSnap] = await Promise.all([
      getDocs(collection(db, "articles")),
      getDocs(collection(db, "users")),
      getDocs(collection(db, "subscribers")),
      getDocs(collection(db, "comments")),
    ]);

    const published = articleSnap.docs.filter((d) => (d.data().status ?? "published") === "published");
    const drafts = articleSnap.docs.filter((d) => d.data().status === "draft");
    const totalViews = published.reduce((sum, d) => sum + Number(d.data().views ?? 0), 0);

    const monthLabel = (d: Date) => d.toLocaleString("en-US", { month: "short" });
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const inMonth = published.filter((doc) => {
        const ts = new Date((doc.data().publishedAt as string) ?? "");
        return !Number.isNaN(ts.getTime()) && ts >= d && ts < next;
      });
      return {
        label: monthLabel(d),
        views: inMonth.reduce((sum, doc) => sum + Number(doc.data().views ?? 0), 0),
        articles: inMonth.length,
      };
    });

    const categoryColors = new Map<string, string>();
    const categoryCounts = new Map<string, number>();
    published.forEach((d) => {
      const cat = (d.data().category as string) ?? "bangladesh";
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
      if (!categoryColors.has(cat)) categoryColors.set(cat, (d.data().categoryColor as string) ?? "#E50914");
    });
    const categoryDistribution = [...categoryCounts.entries()].map(([name, value]) => ({
      name,
      value,
      color: categoryColors.get(name) ?? "#E50914",
    }));

    const topPages = [...published]
      .sort((a, b) => Number(b.data().views ?? 0) - Number(a.data().views ?? 0))
      .slice(0, 5)
      .map((d) => ({
        page: `/article/${(d.data().slug as string) ?? d.id}`,
        title: (d.data().titleBn as string) || (d.data().title as string) || d.id,
        views: Number(d.data().views ?? 0),
      }));

    const contentStatus = [
      { name: "Published", value: published.length, color: "#22C55E" },
      { name: "Draft", value: drafts.length, color: "#64748B" },
    ];

    return {
      totalViews,
      totalArticles: published.length,
      draftArticles: drafts.length,
      totalUsers: userSnap.size,
      totalSubscribers: subscriberSnap.size,
      totalComments: commentSnap.size,
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
