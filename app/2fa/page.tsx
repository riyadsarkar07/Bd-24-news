import type { Metadata } from "next";
import { TwoFactorForm } from "@/features/auth/two-factor-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Two-Factor Authentication — 2FA",
  description: `${siteConfig.name} 2FA যাচাই।`,
  robots: { index: false, follow: false },
};

export default function TwoFactorPage() {
  return <TwoFactorForm />;
}
