import type { Metadata } from "next";
import { MarketsPage } from "@/features/markets/markets-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Markets — বাজার",
  description: `শেয়ারবাজার, সোনা, মুদ্রা ও ক্রিপ্টো দর। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/markets` },
};

export default function MarketsRoute() {
  return <MarketsPage />;
}
