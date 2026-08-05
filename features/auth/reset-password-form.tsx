"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

const schema = z
  .object({ password: z.string().min(8, "At least 8 characters"), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Schema = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success(lang === "bn" ? "পাসওয়ার্ড পরিবর্তন হয়েছে!" : "Password updated!");
    router.push("/login");
  };

  return (
    <AuthLayout
      title="Reset Password"
      titleBn="নতুন পাসওয়ার্ড"
      subtitle={lang === "bn" ? "একটি শক্তিশালী নতুন পাসওয়ার্ড দিন" : "Choose a strong new password"}
      footer={
        <Link href="/login" className="font-bold text-brand hover:underline">
          {lang === "bn" ? "লগইনে ফিরুন" : "Back to login"}
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">{lang === "bn" ? "নতুন পাসওয়ার্ড" : "New password"}</Label>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" {...register("password")} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-danger">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm password"}</Label>
          <Input id="confirm" type={show ? "text" : "password"} placeholder="••••••••" {...register("confirm")} />
          {errors.confirm && <p className="text-xs font-medium text-danger">{errors.confirm.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {lang === "bn" ? "পাসওয়ার্ড রিসেট করুন" : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
