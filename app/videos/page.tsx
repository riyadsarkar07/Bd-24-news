import type { Metadata } from "next";
import { VideosPage } from "@/features/videos/videos-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Videos — ভিডিও",
  description: `বাংলাদেশের শীর্ষ ভিডিও খবর ও ডকুমেন্টারি। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/videos` },
};

export default function VideosRoute() {
  return <VideosPage />;
}
