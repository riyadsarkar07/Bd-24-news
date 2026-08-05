import type { Metadata } from "next";
import { AnalyticsManager } from "@/features/admin/analytics-manager";

export const metadata: Metadata = { title: "Analytics — BD24News", robots: { index: false, follow: false } };

export default function AdminAnalyticsPage() {
  return <AnalyticsManager />;
}
