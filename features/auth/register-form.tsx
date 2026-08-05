"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, UserPlus, Eye, EyeOff, Facebook, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/providers/language-provider";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
    terms: z.boolean().refine((v) => v, "You must accept the terms"),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

type Schema = z.infer<typeof schema>;

export function RegisterForm() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({ resolver: zodResolver(schema), defaultValues: { terms: true } });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 900));
    toast.success(lang === "bn" ? "নিবন্ধন সফল! আপনার ইমেইল ভেরিফাই করুন" : "Registered! Please verify your email");
    router.push("/verify-email");
  };

  return (
    <AuthLayout
      title="Create Account"
      titleBn="নিবন্ধন"
      subtitle={lang === "bn" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Join BD24News community"}
      footer={
        <span>
          {lang === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
          <Link href="/login" className="font-bold text-brand hover:underline">
            {lang === "bn" ? "লগইন" : "Sign in"}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">{lang === "bn" ? "পুরো নাম" : "Full name"}</Label>
          <Input id="name" placeholder={lang === "bn" ? "আপনার নাম" : "Your name"} {...register("name")} />
          {errors.name && <p className="text-xs font-medium text-danger">{errors.name.message}</p>}
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="confirm">{lang === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm password"}</Label>
          <Input id="confirm" type={show ? "text" : "password"} placeholder="••••••••" {...register("confirm")} />
          {errors.confirm && <p className="text-xs font-medium text-danger">{errors.confirm.message}</p>}
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
          <Checkbox className="mt-0.5" {...register("terms")} />
          <span>
            {lang === "bn" ? "আমি " : "I agree to the "}
            <Link href="/terms" className="font-semibold text-brand hover:underline">
              {lang === "bn" ? "শর্তাবলী" : "Terms"}
            </Link>{" "}
            {lang === "bn" ? "ও " : "and "}
            <Link href="/privacy-policy" className="font-semibold text-brand hover:underline">
              {lang === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}
            </Link>
          </span>
        </label>
        {errors.terms && <p className="text-xs font-medium text-danger">{errors.terms.message}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {lang === "bn" ? "নিবন্ধন করুন" : "Create account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => toast.success("Google")}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </Button>
        <Button variant="outline" onClick={() => toast.success("Facebook")}>
          <Facebook className="h-4 w-4 text-[#1877F2]" />
          Facebook
        </Button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        {lang === "bn" ? "আপনার তথ্য ১০০% নিরাপদ" : "Your data is 100% secure"}
      </p>
    </AuthLayout>
  );
}
