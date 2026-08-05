import type { Metadata } from "next";
import { RestoreManager } from "@/features/admin/restore-manager";

export const metadata: Metadata = { title: "Restore — BD24News", robots: { index: false, follow: false } };

export default function AdminRestorePage() {
  return <RestoreManager />;
}
