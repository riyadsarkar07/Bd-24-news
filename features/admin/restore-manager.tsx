"use client";

import * as React from "react";
import { RotateCcw, UploadCloud, AlertTriangle, Database } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/features/admin/admin-table";
import toast from "react-hot-toast";
import { useLanguage } from "@/providers/language-provider";

const restorePoints = [
  { id: "r1", label: "Full site backup", date: "2026-08-05 03:00", scope: "Articles, categories, media, settings", status: "Ready" as const },
  { id: "r2", label: "Database dump", date: "2026-08-04 03:00", scope: "Articles, users, comments", status: "Ready" as const },
  { id: "r3", label: "Media library", date: "2026-08-03 03:00", scope: "Images and videos", status: "Ready" as const },
];

export function RestoreManager() {
  const { lang } = useLanguage();
  const [pending, setPending] = React.useState<typeof restorePoints[number] | null>(null);

  const restore = () => {
    if (!pending) return;
    toast.success(lang === "bn" ? "রিস্টোর শুরু হয়েছে" : "Restore started");
    setPending(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={lang === "bn" ? "রিস্টোর" : "Restore"} description="Restore site from a previous backup" />

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-bold">{lang === "bn" ? "সতর্কতা" : "Warning"}</p>
            <p className="text-muted-foreground">
              {lang === "bn"
                ? "রিস্টোর করা হলে বর্তমান ডেটা ওভাররাইট হবে। চালিয়ে যাওয়ার আগে সর্বশেষ ব্যাকআপ নিন।"
                : "Restoring will overwrite current data. Take a fresh backup before proceeding."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {restorePoints.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <span className="rounded-xl bg-accentblue/10 p-3 text-accentblue"><Database className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.date} • {r.scope}</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success">{r.status}</Badge>
              <Button variant="outline" onClick={() => setPending(r)}>
                <RotateCcw className="h-4 w-4" /> {lang === "bn" ? "রিস্টোর করুন" : "Restore"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-bold">{lang === "bn" ? "আপলোড থেকে রিস্টোর" : "Restore from upload"}</p>
            <p className="text-sm text-muted-foreground">{lang === "bn" ? "অন্য পরিবেশ থেকে ব্যাকআপ ফাইল আপলোড করুন" : "Upload a backup file from another environment"}</p>
          </div>
          <Button variant="outline" onClick={() => toast.success(lang === "bn" ? "ফাইল নির্বাচন করা হয়েছে" : "File selected")}>
            <UploadCloud className="h-4 w-4" /> {lang === "bn" ? "ফাইল নির্বাচন করুন" : "Choose file"}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(v) => !v && setPending(null)}
        title={lang === "bn" ? "রিস্টোর নিশ্চিত করুন" : "Confirm restore"}
        description={lang === "bn" ? `"${pending?.label}" থেকে সাইট রিস্টোর হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।` : `The site will be restored from "${pending?.label}". This cannot be undone.`}
        onConfirm={restore}
      />
    </div>
  );
}
