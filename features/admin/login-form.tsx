"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Lock, Eye, EyeOff, Mail } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInAdmin, resetAdminPassword, ADMIN_EMAILS } from "@/services/authService";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type Schema = z.infer<typeof schema>;

export function AdminLoginForm() {
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Schema) => {
    try {
      await signInAdmin(data.email, data.password);
      toast.success("Signed in successfully!");
      router.replace("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      toast.error(message);
    }
  };

  const onForgot = async () => {
    const email = getValues("email") || ADMIN_EMAILS[0] || "bd24news@tensi.org";
    try {
      await resetAdminPassword(email);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-accentblue/20 blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center text-white">
            <Logo compact />
            <h1 className="mt-4 font-bengali text-2xl font-black">অ্যাডমিন লগইন</h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/50">Admin Panel</p>
            <p className="mt-3 flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-300">
              <Lock className="h-3.5 w-3.5" /> Administrator access only
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder={ADMIN_EMAILS[0]}
                  className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/30"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs font-medium text-danger">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  className="border-white/10 bg-white/5 pl-9 pr-10 text-white placeholder:text-white/30"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-danger">{errors.password.message}</p>}
            </div>

            <button type="button" onClick={onForgot} className="block text-sm font-semibold text-brand-300 hover:underline">
              Forgot password?
            </button>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Sign in to Admin Panel
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-white/40">
          Only registered administrator accounts can access the admin panel. Public registration is disabled.
        </p>
      </div>
    </div>
  );
}
