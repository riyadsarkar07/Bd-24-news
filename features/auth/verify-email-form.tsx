"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

export function VerifyEmailForm() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = React.useState(false);
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, value: string) => {
    if (value.length > 1) return;
    const next = [...code];
    next[i] = value;
    setCode(next);
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const submit = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error("Authentication is unavailable.");
      const { error } = await client.auth.verifyOtp({ email: email.trim(), token: code.join(""), type: "signup" });
      if (error) throw error;
      router.replace("/login");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Verification failed."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout
      title="Email Verification"
      titleBn="ইমেইল ভেরিফিকেশন"
      subtitle={lang === "bn" ? "আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোড দিন" : "Enter the 6-digit code sent to your email"}
    >
      <div className="space-y-6">
        <label className="block">Email<input className="block w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <div className="flex justify-center gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-12 rounded-xl border border-input bg-background text-center text-2xl font-black outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          ))}
        </div>
        <Button onClick={submit} disabled={loading || code.some((c) => !c)} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
          {lang === "bn" ? "ভেরিফাই করুন" : "Verify email"}
        </Button>
      </div>
    </AuthLayout>
  );
}
