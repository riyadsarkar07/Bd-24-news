"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

export function TwoFactorForm() {
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

  const submit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success(lang === "bn" ? "2FA সফল!" : "2FA verified!");
    router.push("/");
  };

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      titleBn="টু-ফ্যাক্টর অথেনটিকেশন"
      subtitle={lang === "bn" ? "আপনার অথেনটিকেটর অ্যাপ থেকে কোড দিন" : "Enter the code from your authenticator app"}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-2xl bg-accentblue/10 p-4">
          <ShieldCheck className="h-8 w-8 shrink-0 text-accentblue" />
          <p className="text-xs text-muted-foreground">
            {lang === "bn"
              ? "আপনার অ্যাকাউন্ট আরও সুরক্ষিত করতে Google Authenticator বা Authy অ্যাপ ব্যবহার করুন।"
              : "Protect your account with Google Authenticator or Authy."}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-12 rounded-xl border border-input bg-background text-center text-2xl font-black outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          ))}
        </div>
        <Button onClick={submit} disabled={loading || code.some((c) => !c)} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {lang === "bn" ? "যাচাই করুন" : "Verify"}
        </Button>
      </div>
    </AuthLayout>
  );
}
