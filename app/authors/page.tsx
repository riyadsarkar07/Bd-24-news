import type { Metadata } from "next";
import { AuthorsPage } from "@/features/authors/authors-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Authors — লেখকবৃন্দ",
  description: `বিডি২৪নিউজের সাংবাদিক ও লেখকবৃন্দ। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/authors` },
};

export default function AuthorsRoute() {
  return <AuthorsPage />;
}
