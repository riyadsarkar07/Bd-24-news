import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Forgot Password — পাসওয়ার্ড রিসেট",
  description: `${siteConfig.name} পাসওয়ার্ড রিসেট।`,
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
