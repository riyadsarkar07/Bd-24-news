import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/contact-form";
import { StaticPage } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — যোগাযোগ",
  description: `বিডি২৪নিউজের সাথে যোগাযোগ করুন। ${siteConfig.email}`,
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact Us"
      titleBn="যোগাযোগ"
      breadcrumb="যোগাযোগ"
      subtitle="আমাদের সাথে যেকোনো সময় যোগাযোগ করুন — খবর পাঠান, মতামত জানান বা বিজ্ঞাপনের জন্য"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { icon: Mail, label: "ইমেইল", value: siteConfig.email },
          { icon: Phone, label: "ফোন", value: siteConfig.phone },
          { icon: MapPin, label: "ঠিকানা", value: siteConfig.address },
          { icon: Clock, label: "নিউজরুম", value: "২৪ ঘণ্টা, সপ্তাহের ৭ দিন" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      <ContactForm />
    </StaticPage>
  );
}
