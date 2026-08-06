"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { signInAdmin } from "@/services/authService";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Schema) => {
    try {
      await signInAdmin(data.email, data.password);
      toast.success(lang === "bn" ? "সফলভাবে লগইন হয়েছে!" : "Logged in successfully!");
      router.push("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      toast.error(lang === "bn" ? "লগইন ব্যর্থ হয়েছে" : message);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      titleBn="লগইন"
      subtitle={lang === "bn" ? "অ্যাডমিন অ্যাকাউন্টে প্রবেশ করুন" : "Sign in to your admin account"}
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
          <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">
            {lang === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
          </Link>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {lang === "bn" ? "লগইন করুন" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
