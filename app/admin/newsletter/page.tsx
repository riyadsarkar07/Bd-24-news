import type { Metadata } from "next";
import { NewsletterManager } from "@/features/admin/newsletter-manager";

export const metadata: Metadata = { title: "Newsletter — BD24News", robots: { index: false, follow: false } };

export default function AdminNewsletterPage() {
  return <NewsletterManager />;
}
