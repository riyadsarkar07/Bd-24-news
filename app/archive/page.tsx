import type { Metadata } from "next";
import { ArchivePage } from "@/features/archive/archive-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Archive — আর্কাইভ",
  description: `পুরাতন খবরের আর্কাইভ। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/archive` },
};

export default function ArchiveRoute() {
  return <ArchivePage />;
}
