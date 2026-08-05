import type { Metadata } from "next";
import { BackupManager } from "@/features/admin/backup-manager";

export const metadata: Metadata = { title: "Backup — BD24News", robots: { index: false, follow: false } };

export default function AdminBackupPage() {
  return <BackupManager />;
}
