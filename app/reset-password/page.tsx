import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Reset Password — নতুন পাসওয়ার্ড",
  description: `${siteConfig.name} পাসওয়ার্ড রিসেট।`,
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
