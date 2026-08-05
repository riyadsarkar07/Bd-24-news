"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-danger/10 text-danger">
        <AlertTriangle className="h-10 w-10" />
      </span>
      <h1 className="mt-6 font-bengali text-3xl font-black">সার্ভার ত্রুটি</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        কিছু একটা ভুল হয়েছে। আমরা সমস্যাটি সমাধানে কাজ করছি। কিছুক্ষণ পরে আবার চেষ্টা করুন।
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4" /> আবার চেষ্টা করুন
        </Button>
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4" /> হোম
          </Button>
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Error: {error.message}</p>
    </div>
  );
}
