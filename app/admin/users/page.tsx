import type { Metadata } from "next";
import { UsersManager } from "@/features/admin/users-manager";

export const metadata: Metadata = { title: "Users — BD24News", robots: { index: false, follow: false } };

export default function AdminUsersPage() {
  return <UsersManager />;
}
