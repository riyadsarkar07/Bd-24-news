import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const input = z.object({ campaign: z.string().uuid(), schedule: z.boolean() });
function failure(message: string, status: number) {
  return Response.json({ message }, { status });
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization");
  if (!token?.startsWith("Bearer ")) return failure("Sign in required.", 401);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return failure("Database unavailable.", 503);
  const db = createClient(url, key, { global: { headers: { Authorization: token } }, auth: { persistSession: false } });
  const access = await db.rpc("is_admin");
  if (access.error || access.data !== true) return failure("Administrator access required.", 403);
  if (!process.env.RESEND_API_KEY || !process.env.NEWSLETTER_FROM)
    return failure("Draft saved. Configure email delivery before sending.", 503);

  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure("Invalid campaign.", 400);
  const { campaign, schedule } = parsed.data;
  const started = await db.rpc("start_newsletter_delivery", { campaign, schedule });
  if (started.error) return failure(started.error.message, 400);
  const result = await db.from("newsletters").select("*").eq("id", campaign).single();
  if (result.error) return failure("Campaign unavailable.", 503);
  const row = result.data;
  if (row.status !== "draft") return Response.json({ done: true, status: row.status });

  const pending = await db.from("newsletter_deliveries").select("email")
    .eq("campaign_id", campaign).is("provider_id", null).order("email").limit(5);
  if (pending.error) return failure("Delivery state unavailable.", 503);
  for (const recipient of pending.data) {
    if (Date.now() - Date.parse(row.delivery_started_at) >= 23 * 3600000)
      return failure("Delivery paused. Reconcile outstanding recipients with the email provider before retrying.", 409);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json",
        "Idempotency-Key": campaign + "/" + createHash("sha256").update(recipient.email).digest("hex"),
      },
      body: JSON.stringify({ from: process.env.NEWSLETTER_FROM, to: [recipient.email],
        subject: row.subject_bn, text: row.body, scheduled_at: row.scheduled_for ?? undefined }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return failure("Provider has not confirmed delivery. Resume this draft to retry.", 503);
    const receipt = await response.json();
    if (!receipt.id) return failure("Missing delivery receipt.", 503);
    const recorded = await db.from("newsletter_deliveries").update({ provider_id: receipt.id })
      .eq("campaign_id", campaign).eq("email", recipient.email);
    if (recorded.error) return failure("Could not record receipt. Retry this draft.", 503);
    await new Promise((resolve) => setTimeout(resolve, 550));
  }
  if (pending.data.length === 5) return Response.json({ done: false });
  const status = row.scheduled_for ? "scheduled" : "sent";
  const saved = await db.from("newsletters").update({ status, sent_at: row.scheduled_for ?? new Date().toISOString() })
    .eq("id", campaign).eq("status", "draft");
  if (saved.error) return failure("Could not finalize campaign.", 503);
  return Response.json({ done: true, status });
}
