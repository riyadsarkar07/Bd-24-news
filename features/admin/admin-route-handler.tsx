"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { onAuthStateChange, isAdminUid } from "@/services/authService";
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
  const [state, setState] = React.useState<"loading" | "authed" | "unauth">(isLogin ? "authed" : "loading");

  React.useEffect(() => {
    if (isLogin) {
      setState("authed");
      return;
    }
    let active = true;
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (active) {
            const user = data.session?.user ?? null;
            setState(user && isAdminUid(user.id) ? "authed" : "unauth");
          }
        })
        .catch(() => {
          if (active) setState("unauth");
        });
    } else {
      setState("unauth");
    }
    const unsub = onAuthStateChange((user) => {
      if (active) setState(user && isAdminUid(user.id) ? "authed" : "unauth");
    });
    return () => {
      active = false;
      unsub();
    };
  }, [isLogin]);

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

  return <AdminLayout>{children}</AdminLayout>;
}
