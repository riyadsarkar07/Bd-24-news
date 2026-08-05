import type { Metadata } from "next";
import { NewsManager } from "@/features/admin/news-manager";

export const metadata: Metadata = {
  title: "News Management — BD24News",
  robots: { index: false, follow: false },
};

export default function AdminNewsPage() {
  return <NewsManager />;
}
