import type { Metadata } from "next";
import { AdsManager } from "@/features/admin/ads-manager";

export const metadata: Metadata = { title: "Advertisements — BD24News", robots: { index: false, follow: false } };

export default function AdminAdsPage() {
  return <AdsManager />;
}
