import type { Metadata } from "next";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Verify Email — ইমেইল ভেরিফিকেশন",
  description: `${siteConfig.name} ইমেইল ভেরিফিকেশন।`,
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
