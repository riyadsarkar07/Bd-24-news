import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard — BD24News",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
