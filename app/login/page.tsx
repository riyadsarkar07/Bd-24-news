import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Login — লগইন",
  description: `${siteConfig.name} এ লগইন করুন।`,
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
