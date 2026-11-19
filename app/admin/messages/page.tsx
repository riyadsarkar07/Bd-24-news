"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";

export default function ContactInbox() {
  const inbox = useQuery({
    queryKey: ["admin", "contact-messages"],
    queryFn: async () => {
      const db = getSupabase();
      if (!db) throw new Error("Database unavailable");
      const { data, error } = await db.from("contact_messages").select("id,name,email,subject,message,created_at")
        .order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
  return <section className="space-y-4">
    <h1 className="text-2xl font-bold">সর্বশেষ ১০০টি যোগাযোগ বার্তা</h1>
    {inbox.isPending && <p>লোড হচ্ছে…</p>}
    {inbox.isError && <p role="alert">বার্তা লোড করা যায়নি।</p>}
    {inbox.data?.length === 0 && <p>এখনও কোনো বার্তা নেই।</p>}
    {inbox.data?.map((row) => <article key={row.id} className="rounded border p-4">
      <h2 className="font-semibold">{row.subject}</h2>
      <p className="text-sm">{row.name} · {row.email} · {new Date(row.created_at).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}</p>
      <p className="mt-3 whitespace-pre-wrap break-words">{row.message}</p>
    </article>)}
  </section>;
}
