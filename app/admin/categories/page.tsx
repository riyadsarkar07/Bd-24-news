import type { Metadata } from "next";
import { CategoriesManager } from "@/features/admin/categories-manager";

export const metadata: Metadata = { title: "Categories — BD24News", robots: { index: false, follow: false } };

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}
