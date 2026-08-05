import type { Metadata } from "next";
import { TagsManager } from "@/features/admin/tags-manager";

export const metadata: Metadata = { title: "Tags — BD24News", robots: { index: false, follow: false } };

export default function AdminTagsPage() {
  return <TagsManager />;
}
