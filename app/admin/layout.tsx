import { AdminRouteHandler } from "@/features/admin/admin-route-handler";

export default function AdminLayoutPage({ children }: { children: React.ReactNode }) {
  return <AdminRouteHandler>{children}</AdminRouteHandler>;
}
