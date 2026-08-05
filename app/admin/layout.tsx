import { AdminLayout } from "@/features/admin/admin-layout";

export default function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
