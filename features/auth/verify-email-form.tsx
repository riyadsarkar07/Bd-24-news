"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

export function VerifyEmailForm() {
  const { lang } = useLanguage();
  const router = useRouter();
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
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success(lang === "bn" ? "ইমেইল ভেরিফাই হয়েছে!" : "Email verified!");
    router.push("/login");
  };

  return (
    <AuthLayout
      title="Email Verification"
      titleBn="ইমেইল ভেরিফিকেশন"
      subtitle={lang === "bn" ? "আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোড দিন" : "Enter the 6-digit code sent to your email"}
    >
      <div className="space-y-6">
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
        <button
          onClick={() => toast.success(lang === "bn" ? "নতুন কোড পাঠানো হয়েছে" : "New code sent")}
          className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {lang === "bn" ? "কোড না পেয়েছেন? আবার পাঠান" : "Resend code"}
        </button>
      </div>
    </AuthLayout>
  );
}
