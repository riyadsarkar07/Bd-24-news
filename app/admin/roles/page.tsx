import type { Metadata } from "next";
import { RolesManager } from "@/features/admin/roles-manager";

export const metadata: Metadata = { title: "Roles — BD24News", robots: { index: false, follow: false } };

export default function AdminRolesPage() {
  return <RolesManager />;
}
