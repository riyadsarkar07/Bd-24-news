import type { Metadata } from "next";
import { GalleryPage } from "@/features/gallery/gallery-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Photo Gallery — ফটো গ্যালারি",
  description: `বাংলাদেশের সেরা ফটো গ্যালারি। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/gallery` },
};

export default function GalleryRoute() {
  return <GalleryPage />;
}
