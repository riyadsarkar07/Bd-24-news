"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { newsroomRoutes } from "@/services/authService";
import { getSupabase } from "@/lib/supabase/client";
import { AdminLayout } from "@/features/admin/admin-layout";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 dark:bg-navy-950/60">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-semibold">Checking admin session…</p>
      </div>
    </div>
  );
}

export function AdminRouteHandler({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname?.startsWith("/admin/login");
  const [sections, setSections] = React.useState<string[]>([]);
  const [state, setState] = React.useState<"loading" | "authed" | "unauth">(isLogin ? "authed" : "loading");

  React.useEffect(() => {
    if (isLogin) {
      setState("authed");
      return;
    }
    let active = true;
    let revision = 0;
    setState("loading");
    const client = getSupabase();
    if (!client) { setState("unauth"); return; }
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const current = ++revision;
      if (!session) { setState("unauth"); return; }
      // Auth callbacks must return before invoking another auth API.
      setTimeout(async () => {
        try {
          const allowed = await newsroomRoutes();
          const target = allowed[0] ?? "/admin/login";
          if (!active || current !== revision) return;
          if (target === "/admin" || allowed.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
            setSections(allowed);
            setState("authed");
          } else {
            setState("loading");
            router.replace(target);
          }
        } catch { if (active && current === revision) setState("unauth"); }
      }, 0);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [isLogin, pathname, router]);

  React.useEffect(() => {
    if (!isLogin && state === "unauth") {
      router.replace("/admin/login");
    }
  }, [state, isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (state !== "authed") {
    return <FullScreenLoader />;
  }

  return <AdminLayout sections={sections}>{children}</AdminLayout>;
}
