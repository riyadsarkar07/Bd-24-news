"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { resetAdminPassword } from "@/services/authService";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Schema = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const { lang } = useLanguage();
  const [sent, setSent] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Schema) => {
    try {
      await resetAdminPassword(data.email);
      setSent(true);
      toast.success(lang === "bn" ? "রিসেট লিংক পাঠানো হয়েছে" : "Reset link sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      titleBn="পাসওয়ার্ড ভুলে গেছেন?"
      subtitle={lang === "bn" ? "আপনার ইমেইলে রিসেট লিংক পাঠানো হবে" : "We'll email you a reset link"}
      footer={
        <Link href="/login" className="flex items-center justify-center gap-1.5 font-bold text-brand hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> {lang === "bn" ? "লগইনে ফিরুন" : "Back to login"}
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-success/10 p-6 text-center">
          <MailCheck className="h-10 w-10 text-success" />
          <p className="text-sm font-semibold">
            {lang === "bn" ? "রিসেট লিংক পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন।" : "Reset link sent! Check your inbox."}
          </p>
          <Link href="/reset-password">
            <Button variant="outline" size="sm">{lang === "bn" ? "রিসেট পেজে যান" : "Go to reset page"}</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs font-medium text-danger">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
            {lang === "bn" ? "রিসেট লিংক পাঠান" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
