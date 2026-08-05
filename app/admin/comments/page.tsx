import type { Metadata } from "next";
import { CommentsManager } from "@/features/admin/comments-manager";

export const metadata: Metadata = { title: "Comments — BD24News", robots: { index: false, follow: false } };

export default function AdminCommentsPage() {
  return <CommentsManager />;
}
