import type { Metadata } from "next";
import { PrayerPage } from "@/features/prayer/prayer-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Prayer Times — নামাজের সময়সূচি",
  description: `ঢাকার নামাজের সময়সূচি। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/prayer-times` },
};

export default function PrayerRoute() {
  return <PrayerPage />;
}
