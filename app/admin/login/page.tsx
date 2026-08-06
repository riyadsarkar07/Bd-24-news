import type { Metadata } from "next";
import { AdminLoginForm } from "@/features/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login — BD24News",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
