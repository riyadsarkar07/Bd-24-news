import type { Metadata } from "next";
import { SearchPage } from "@/features/search/search-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Search — অনুসন্ধান",
  description: `বিডি২৪নিউজে খুঁজুন। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/search` },
};

export default function SearchRoute() {
  return <SearchPage />;
}
