import type { Metadata } from "next";
import { ProfileManager } from "@/features/admin/profile-manager";

export const metadata: Metadata = { title: "Profile — BD24News", robots: { index: false, follow: false } };

export default function AdminProfilePage() {
  return <ProfileManager />;
}
