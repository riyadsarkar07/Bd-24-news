import type { Metadata } from "next";
import { SubscribersManager } from "@/features/admin/subscribers-manager";

export const metadata: Metadata = { title: "Subscribers — BD24News", robots: { index: false, follow: false } };

export default function AdminSubscribersPage() {
  return <SubscribersManager />;
}
