"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { addSubscriber } from "@/services/cmsService";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type Schema = z.infer<typeof schema>;

export function NewsletterForm({ variant = "default" }: { variant?: "default" | "footer" }) {
  const { lang } = useLanguage();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: Schema) => {
    try {
      await addSubscriber(email);
      toast.success(lang === "bn" ? "সাবস্ক্রিপশন সফল হয়েছে!" : "Subscription successful!");
      reset();
    } catch {
      toast.error(lang === "bn" ? "সাবস্ক্রিপশন ব্যর্থ হয়েছে, আবার চেষ্টা করুন" : "Subscription failed, please try again");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2" noValidate>
      <div className={cn("flex gap-2", variant === "footer" && "flex-col sm:flex-row")}>
        <Input
          type="email"
          placeholder={lang === "bn" ? "আপনার ইমেইল" : "Your email"}
          aria-label={lang === "bn" ? "ইমেইল" : "Email"}
          className={cn(
            variant === "footer" && "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-brand",
          )}
          {...register("email")}
        />
        <Button type="submit" disabled={isSubmitting} className="shrink-0">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {lang === "bn" ? "সাবস্ক্রাইব" : "Subscribe"}
        </Button>
      </div>
      {errors.email && <p className="text-xs font-medium text-danger">{errors.email.message}</p>}
    </form>
  );
}
