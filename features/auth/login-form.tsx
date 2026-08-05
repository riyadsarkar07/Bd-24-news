"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, LogIn, Eye, EyeOff, Facebook, Lock } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/providers/language-provider";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type Schema = z.infer<typeof schema>;

export function LoginForm() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({ resolver: zodResolver(schema), defaultValues: { remember: true } });

  const onSubmit = async (data: Schema) => {
    await new Promise((r) => setTimeout(r, 900));
    localStorage.setItem("bd24news_user", JSON.stringify({ name: "Demo User", email: data.email, role: "subscriber" }));
    toast.success(lang === "bn" ? "সফলভাবে লগইন হয়েছে!" : "Logged in successfully!");
    router.push("/");
  };

  return (
    <AuthLayout
      title="Sign In"
      titleBn="লগইন"
      subtitle={lang === "bn" ? "আপনার অ্যাকাউন্টে প্রবেশ করুন" : "Welcome back to your account"}
      footer={
        <span>
          {lang === "bn" ? "অ্যাকাউন্ট নেই?" : "Don't have an account?"}{" "}
          <Link href="/register" className="font-bold text-brand hover:underline">
            {lang === "bn" ? "নিবন্ধন করুন" : "Register"}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs font-medium text-danger">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{lang === "bn" ? "পাসওয়ার্ড" : "Password"}</Label>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" {...register("password")} />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle password visibility"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-danger">{errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox {...register("remember")} />
            {lang === "bn" ? "মনে রাখুন" : "Remember me"}
          </label>
          <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">
            {lang === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
          </Link>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {lang === "bn" ? "লগইন করুন" : "Sign in"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => toast.success(lang === "bn" ? "গুগল লগইন" : "Google login")}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </Button>
        <Button variant="outline" onClick={() => toast.success(lang === "bn" ? "ফেসবুক লগইন" : "Facebook login")}>
          <Facebook className="h-4 w-4 text-[#1877F2]" />
          Facebook
        </Button>
      </div>

      <Link href="/2fa" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand">
        <Lock className="h-3.5 w-3.5" />
        {lang === "bn" ? "টু-ফ্যাক্টর অথেনটিকেশন সেটআপ" : "Set up two-factor authentication"}
      </Link>
    </AuthLayout>
  );
}
