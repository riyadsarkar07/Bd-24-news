import type { Metadata } from "next";
import { MediaManager } from "@/features/admin/media-manager";

export const metadata: Metadata = { title: "Media — BD24News", robots: { index: false, follow: false } };

export default function AdminMediaPage() {
  return <MediaManager />;
}
