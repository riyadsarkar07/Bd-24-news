import type { Metadata } from "next";
import { LiveTvPage } from "@/features/live-tv/live-tv-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Live TV — লাইভ টিভি",
  description: `বিডি২৪ নিউজ লাইভ স্ট্রিমিং। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/live-tv` },
};

export default function LiveTvRoute() {
  return <LiveTvPage />;
}
