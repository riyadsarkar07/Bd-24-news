import type { Metadata } from "next";
import { SettingsManager } from "@/features/admin/settings-manager";

export const metadata: Metadata = { title: "Settings — BD24News", robots: { index: false, follow: false } };

export default function AdminSettingsPage() {
  return <SettingsManager />;
}
