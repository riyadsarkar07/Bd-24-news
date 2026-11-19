"use client";

import * as React from "react";
import { Send, Plus, Mail, MousePointerClick, Eye } from "lucide-react";
import { PageHeader, Toolbar, AdminTable, type AdminColumn } from "@/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getSupabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useAdminCollection } from "@/features/admin/use-admin-collection";
import { CollectionError, TableSkeleton } from "@/features/admin/collection-state";
import {
  subscribeNewsletters,
  saveNewsletter,
  listSubscribers,

  type AdminNewsletterRow,
} from "@/services/cmsService";

const statusColor: Record<AdminNewsletterRow["status"], string> = {
  sent: "bg-success/15 text-success",
  scheduled: "bg-warning/15 text-warning",
  draft: "bg-muted text-muted-foreground",
};

export function NewsletterManager() {
  const { data, loading, error } = useAdminCollection<AdminNewsletterRow>(subscribeNewsletters);
  const [subscribersCount, setSubscribersCount] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [subjectBn, setSubjectBn] = React.useState("");
  const [subjectEn, setSubjectEn] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    listSubscribers()
      .then((rows) => mounted && setSubscribersCount(rows.length))
      .catch(() => mounted && setSubscribersCount(0));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = data.filter((r) => r.subjectBn.toLowerCase().includes(search.toLowerCase()) || r.subjectEn.toLowerCase().includes(search.toLowerCase()));

  const columns: AdminColumn<AdminNewsletterRow>[] = [
    {
      key: "subject",
      header: "Campaign",
      className: "min-w-[300px]",
      render: (r) => (
        <div>
          <p className="font-bold">{r.subjectBn || "Untitled"}</p>
          <p className="text-xs text-muted-foreground">{r.subjectEn}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <Badge variant="outline" className={`border-0 capitalize ${statusColor[r.status]}`}>{r.status}</Badge> },
    {
      key: "performance",
      header: "Performance",
      render: (r) => (
        <div className="w-36">
          <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{r.opens.toLocaleString()}</span>
            <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{r.clicks.toLocaleString()}</span>
          </div>
          <Progress value={r.recipients ? (r.opens / r.recipients) * 100 : 0} className="h-1.5" />
        </div>
      ),
    },
    { key: "recipients", header: "Recipients", className: "text-right", render: (r) => <span className="tabular-nums">{r.recipients.toLocaleString()}</span> },
    { key: "sent", header: "Sent at", render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}</span> },
  ];

  const reset = () => {
    setSubjectBn("");
    setSubjectEn("");
    setBody("");
  };

  const deliver = async (campaign: string, schedule: boolean) => {
    for (;;) {
      const session = await getSupabase()?.auth.getSession();
      if (!session?.data.session) throw new Error("Sign in required.");
      const response = await fetch("/api/newsletter/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.data.session.access_token },
        body: JSON.stringify({ campaign, schedule }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Email delivery failed.");
      if (result.done) return result.status;
    }
  };

  const send = async (status: AdminNewsletterRow["status"]) => {
    if (!subjectBn.trim() || !body.trim()) { toast.error("Subject and body are required."); return; }
    setSending(true);
    try {
      const id = crypto.randomUUID();
      await saveNewsletter(id, {
        subjectBn, subjectEn: subjectEn || subjectBn, body, status: "draft", recipients: 0,
      });
      setComposeOpen(false);
      reset();
      if (status === "draft") toast.success("Draft saved");
      else toast.success(await deliver(id, status === "scheduled") === "scheduled" ? "Accepted for delivery tomorrow" : "Accepted for delivery");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save or deliver campaign.");
    } finally { setSending(false); }
  };
  const sendDraft = async (row: AdminNewsletterRow) => {
    setSending(true);
    try { const status = await deliver(row.id, false); toast.success(status === "scheduled" ? "Scheduled" : "Accepted for delivery"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Delivery failed"); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter"
        description={`${data.filter((r) => r.status === "sent").length} campaigns sent`}
        action={<Button onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4" /> Compose</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search campaigns…" />
      {error && <CollectionError />}
      {loading ? (
        <TableSkeleton />
      ) : (
        <AdminTable
          columns={columns}
          data={filtered}
          emptyTitle="No campaigns yet"
          emptyDescription="Compose your first newsletter to reach subscribers."
          actions={(r) =>
            r.status === "draft" ? (
              <Button variant="ghost" size="icon-sm" disabled={sending} onClick={() => sendDraft(r)} aria-label="Send now">
                <Send className="h-4 w-4 text-success" />
              </Button>
            ) : null
          }
        />
      )}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compose Newsletter</DialogTitle>
            <DialogDescription>Create a new email campaign for subscribers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nl-bn">Bengali subject</Label>
              <Input id="nl-bn" value={subjectBn} onChange={(e) => setSubjectBn(e.target.value)} placeholder="দৈনিক ডাইজেস্ট: আজকের শীর্ষ ১০ খবর" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nl-en">English subject</Label>
              <Input id="nl-en" value={subjectEn} onChange={(e) => setSubjectEn(e.target.value)} placeholder="Daily Digest: Top 10 stories" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nl-body">Body</Label>
              <Textarea id="nl-body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Newsletter content…" />
            </div>
            <p className="text-xs text-muted-foreground">Recipients: {subscribersCount.toLocaleString()} active subscribers</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={sending} onClick={() => send("draft")}><Mail className="h-4 w-4" /> Draft</Button>
            <Button variant="secondary" disabled={sending} onClick={() => send("scheduled")}>Schedule for tomorrow</Button>
            <Button disabled={sending} onClick={() => send("sent")}><Send className="h-4 w-4" /> Send now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
