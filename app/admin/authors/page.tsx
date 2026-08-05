import type { Metadata } from "next";
import { AuthorsManager } from "@/features/admin/authors-manager";

export const metadata: Metadata = { title: "Authors — BD24News", robots: { index: false, follow: false } };

export default function AdminAuthorsPage() {
  return <AuthorsManager />;
}
