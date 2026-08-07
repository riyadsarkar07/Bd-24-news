"use client";

import * as React from "react";
import { DatabaseBackup, UploadCloud, Download, RotateCcw, CheckCircle2, Clock, RefreshCw, Trash2 } from "lucide-react";
import { PageHeader, ConfirmDialog } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { useLanguage } from "@/providers/language-provider";
import { createBackup, listBackups, deleteBackup, restoreBackup, type BackupRow } from "@/services/backupService";

export function BackupManager() {
  const { lang } = useLanguage();
  const [backups, setBackups] = React.useState<BackupRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [deleting, setDeleting] = React.useState<BackupRow | null>(null);
  const [restoring, setRestoring] = React.useState<BackupRow | null>(null);

  const load = React.useCallback(() => {
    listBackups()
      .then((rows) => setBackups(rows))
      .catch(() => setBackups([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const runBackup = async () => {
    if (running) return;
    setRunning(true);
    try {
      const row = await createBackup("Full site backup");
      setBackups((prev) => [row, ...prev]);
      toast.success(lang === "bn" ? "ব্যাকআপ সম্পন্ন হয়েছে" : "Backup completed");
    } catch {
      toast.error(lang === "bn" ? "ব্যাকআপ ব্যর্থ হয়েছে" : "Backup failed");
    } finally {
      setRunning(false);
    }
  };

  const download = (b: BackupRow) => {
    const rows = backups.filter((x) => x.id === b.id);
    const data = JSON.stringify(rows, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${b.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={lang === "bn" ? "ব্যাকআপ" : "Backup"} description="Site data backup and restore" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DatabaseBackup className="h-5 w-5 text-brand" /> {lang === "bn" ? "নতুন ব্যাকআপ" : "New Backup"}</CardTitle>
          <CardDescription>Create a full snapshot of your Firestore collections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={runBackup} disabled={running}>
              {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {running ? (lang === "bn" ? "ব্যাকআপ চলছে…" : "Backing up…") : (lang === "bn" ? "ব্যাকআপ শুরু করুন" : "Start backup")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : backups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {lang === "bn" ? "কোনো ব্যাকআপ নেই" : "No backups yet"}
            </CardContent>
          </Card>
        ) : (
          backups.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <span className="rounded-xl bg-success/10 p-3 text-success"><CheckCircle2 className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{b.label}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}</p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">{b.collections.length} collections</Badge>
                <span className="text-sm tabular-nums text-muted-foreground">{b.size}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => download(b)}><Download className="h-3.5 w-3.5" /> {lang === "bn" ? "ডাউনলোড" : "Download"}</Button>
                  <Button variant="outline" size="sm" onClick={() => setRestoring(b)}><RotateCcw className="h-3.5 w-3.5" /> {lang === "bn" ? "রিস্টোর" : "Restore"}</Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(b)} aria-label="Delete"><Trash2 className="h-4 w-4 text-danger" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-bold">{lang === "bn" ? "রিস্টোর" : "Restore"}</p>
            <p className="text-sm text-muted-foreground">{lang === "bn" ? "ব্যাকআপ থেকে ডেটা রিস্টোর করতে রিস্টোর ট্যাব ব্যবহার করুন" : "Use a previous backup row above to restore data, or visit the Restore page"}</p>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete backup?"
        description={`This will permanently remove the backup "${deleting?.label}".`}
        onConfirm={async () => {
          if (deleting) {
            try {
              await deleteBackup(deleting.id);
              setBackups((d) => d.filter((r) => r.id !== deleting.id));
              toast.success("Backup deleted");
            } catch {
              toast.error("Failed to delete backup");
            }
          }
        }}
      />

      <ConfirmDialog
        open={!!restoring}
        onOpenChange={(v) => !v && setRestoring(null)}
        title="Restore backup?"
        description={`Current data will be overwritten by "${restoring?.label}". This cannot be undone.`}
        onConfirm={async () => {
          if (restoring) {
            try {
              const written = await restoreBackup(restoring.id);
              toast.success(`${written} documents restored`);
            } catch {
              toast.error("Restore failed");
            }
          }
        }}
      />
    </div>
  );
}
