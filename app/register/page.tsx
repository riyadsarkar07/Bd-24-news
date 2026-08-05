import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/register-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Register — নিবন্ধন",
  description: `${siteConfig.name} এ অ্যাকাউন্ট তৈরি করুন।`,
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
