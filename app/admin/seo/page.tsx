import type { Metadata } from "next";
import { SeoManager } from "@/features/admin/seo-manager";

export const metadata: Metadata = { title: "SEO — BD24News", robots: { index: false, follow: false } };

export default function AdminSeoPage() {
  return <SeoManager />;
}
