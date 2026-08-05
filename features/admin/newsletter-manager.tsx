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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { adminData, type AdminNewsletterRow } from "@/services/adminData";

const statusColor: Record<AdminNewsletterRow["status"], string> = {
  sent: "bg-success/15 text-success",
  scheduled: "bg-warning/15 text-warning",
  draft: "bg-muted text-muted-foreground",
};

export function NewsletterManager() {
  const [data, setData] = React.useState<AdminNewsletterRow[]>(adminData.newsletters);
  const [search, setSearch] = React.useState("");
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [subjectBn, setSubjectBn] = React.useState("");
  const [subjectEn, setSubjectEn] = React.useState("");

  const filtered = data.filter((r) => r.subjectBn.toLowerCase().includes(search.toLowerCase()) || r.subjectEn.toLowerCase().includes(search.toLowerCase()));

  const columns: AdminColumn<AdminNewsletterRow>[] = [
    {
      key: "subject",
      header: "Campaign",
      className: "min-w-[300px]",
      render: (r) => (
        <div>
          <p className="font-bold">{r.subjectBn}</p>
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
    { key: "sent", header: "Sent at", render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.sentAt}</span> },
  ];

  const send = (status: AdminNewsletterRow["status"]) => {
    if (!subjectBn) {
      toast.error("Subject is required");
      return;
    }
    setData((d) => [{
      id: crypto.randomUUID(),
      subjectBn,
      subjectEn: subjectEn || subjectBn,
      sentAt: status === "sent" ? new Date().toISOString().slice(0, 16) : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      opens: 0,
      clicks: 0,
      recipients: 18590,
      status,
    }, ...d]);
    setComposeOpen(false);
    setSubjectBn("");
    setSubjectEn("");
    toast.success(status === "sent" ? "Newsletter sent" : status === "scheduled" ? "Scheduled" : "Saved as draft");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter"
        description={`${data.filter((r) => r.status === "sent").length} campaigns sent`}
        action={<Button onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4" /> Compose</Button>}
      />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search campaigns…" />
      <AdminTable columns={columns} data={filtered} actions={(r) => (
        r.status === "draft" && (
          <Button variant="ghost" size="icon-sm" onClick={() => toast(`Sending "${r.subjectBn}"…`)} aria-label="Send now">
            <Send className="h-4 w-4 text-success" />
          </Button>
        )
      )} />

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
              <Textarea id="nl-body" rows={6} placeholder="Newsletter content…" />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subscribers (18,590)</SelectItem>
                  <SelectItem value="active">Active only (15,240)</SelectItem>
                  <SelectItem value="segment">Tech segment (4,210)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => send("draft")}><Mail className="h-4 w-4" /> Draft</Button>
            <Button variant="secondary" onClick={() => send("scheduled")}>Schedule</Button>
            <Button onClick={() => send("sent")}><Send className="h-4 w-4" /> Send now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
