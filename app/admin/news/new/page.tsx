import type { Metadata } from "next";
import { NewsEditor } from "@/features/admin/news-editor";

export const metadata: Metadata = {
  title: "New Article — BD24News",
  robots: { index: false, follow: false },
};

export default function AdminNewsNewPage() {
  return <NewsEditor />;
}
