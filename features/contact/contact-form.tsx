"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type Schema = z.infer<typeof schema>;

export function ContactForm() {
  const { lang } = useLanguage();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Schema) => {
    await new Promise((r) => setTimeout(r, 900));
    toast.success(lang === "bn" ? "মেসেজ পাঠানো হয়েছে!" : "Message sent!");
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-card" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{lang === "bn" ? "আপনার নাম" : "Your name"}</Label>
          <Input id="name" {...register("name")} placeholder={lang === "bn" ? "নাম" : "Name"} />
          {errors.name && <p className="text-xs font-medium text-danger">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
          {errors.email && <p className="text-xs font-medium text-danger">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">{lang === "bn" ? "বিষয়" : "Subject"}</Label>
        <Input id="subject" {...register("subject")} placeholder={lang === "bn" ? "বিষয় লিখুন" : "Subject"} />
        {errors.subject && <p className="text-xs font-medium text-danger">{errors.subject.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{lang === "bn" ? "মেসেজ" : "Message"}</Label>
        <Textarea id="message" rows={6} {...register("message")} placeholder={lang === "bn" ? "আপনার মেসেজ..." : "Your message..."} />
        {errors.message && <p className="text-xs font-medium text-danger">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {lang === "bn" ? "মেসেজ পাঠান" : "Send message"}
      </Button>
    </form>
  );
}
