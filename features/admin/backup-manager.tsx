"use client";

import * as React from "react";
import { DatabaseBackup, UploadCloud, Download, RotateCcw, CheckCircle2, Clock, HardDrive, RefreshCw } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useLanguage } from "@/providers/language-provider";

const backups = [
  { id: "b1", label: "Full site backup", date: "2026-08-05 03:00", size: "1.2 GB", type: "Full", status: "success" as const },
  { id: "b2", label: "Database dump", date: "2026-08-04 03:00", size: "840 MB", type: "Database", status: "success" as const },
  { id: "b3", label: "Media library", date: "2026-08-03 03:00", size: "6.4 GB", type: "Media", status: "success" as const },
  { id: "b4", label: "Full site backup", date: "2026-08-02 03:00", size: "1.1 GB", type: "Full", status: "success" as const },
];

export function BackupManager() {
  const { lang } = useLanguage();
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const runBackup = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setRunning(false);
          toast.success(lang === "bn" ? "ব্যাকআপ সম্পন্ন হয়েছে" : "Backup completed");
          return 100;
        }
        return p + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={lang === "bn" ? "ব্যাকআপ" : "Backup"} description="Site data backup and restore" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DatabaseBackup className="h-5 w-5 text-brand" /> {lang === "bn" ? "নতুন ব্যাকআপ" : "New Backup"}</CardTitle>
          <CardDescription>Create a full snapshot of your site content and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={runBackup} disabled={running}>
              {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {running ? (lang === "bn" ? "ব্যাকআপ চলছে…" : "Backing up…") : (lang === "bn" ? "ব্যাকআপ শুরু করুন" : "Start backup")}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              {lang === "bn" ? "ব্যবহৃত: 8.4 GB / 20 GB" : "Used: 8.4 GB of 20 GB"}
            </div>
          </div>
          {running && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs font-semibold tabular-nums text-muted-foreground">{progress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {backups.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <span className="rounded-xl bg-success/10 p-3 text-success"><CheckCircle2 className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{b.label}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {b.date}</p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">{b.type}</Badge>
                <span className="text-sm tabular-nums text-muted-foreground">{b.size}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success("Download started")}><Download className="h-3.5 w-3.5" /> {lang === "bn" ? "ডাউনলোড" : "Download"}</Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success(lang === "bn" ? "রিস্টোর সম্পন্ন" : "Restored")}><RotateCcw className="h-3.5 w-3.5" /> {lang === "bn" ? "রিস্টোর" : "Restore"}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-bold">{lang === "bn" ? "ব্যাকআপ ফাইল আপলোড করুন" : "Upload a backup file"}</p>
            <p className="text-sm text-muted-foreground">{lang === "bn" ? "আগের ব্যাকআপ থেকে সাইট রিস্টোর করতে ফাইল নির্বাচন করুন" : "Select a previously created backup to restore"}</p>
          </div>
          <Button variant="outline" onClick={() => toast.success(lang === "bn" ? "রিস্টোর শুরু হয়েছে" : "Restore started")}>
            <UploadCloud className="h-4 w-4" /> {lang === "bn" ? "ফাইল নির্বাচন করুন" : "Choose file"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
