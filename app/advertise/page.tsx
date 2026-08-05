import type { Metadata } from "next";
import { StaticPage } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Advertise With Us — বিজ্ঞাপন",
  description: `বিডি২৪নিউজে বিজ্ঞাপন দিন — মাসিক ${(2.4).toFixed(0)} মিলিয়নের বেশি পাঠক।`,
  alternates: { canonical: `${siteConfig.url}/advertise` },
};

export default function AdvertisePage() {
  return (
    <StaticPage
      title="Advertise With Us"
      titleBn="বিজ্ঞাপন দিন"
      breadcrumb="বিজ্ঞাপন"
      subtitle="মাসিক ২.৪ মিলিয়নের বেশি পাঠকের কাছে আপনার ব্র্যান্ড পৌঁছে দিন"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { big: "2.4M+", small: "মাসিক পাঠক" },
          { big: "30M+", small: "মাসিক পেজ ভিউ" },
          { big: "85%", small: "মোবাইল ব্যবহারকারী" },
        ].map((s) => (
          <div key={s.small} className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-card">
            <p className="font-bengali text-3xl font-black text-brand">{s.big}</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{s.small}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 font-bengali text-2xl font-bold">বিজ্ঞাপনের সুযোগ</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>হেডার ব্যানার ও স্টিকি অ্যাড</li>
        <li>সাইডবার ডিসপ্লে বিজ্ঞাপন</li>
        <li>আর্টিকেলের ভেতরে ইনলাইন বিজ্ঞাপন</li>
        <li>নেটিভ কনটেন্ট ও স্পন্সরড আর্টিকেল</li>
        <li>ভিডিও বিজ্ঞাপন</li>
        <li>নিউজলেটার স্পনসরশিপ</li>
      </ul>
      <p className="mt-6">
        বিজ্ঞাপনের বিস্তারিত জানতে যোগাযোগ করুন: <a className="font-bold text-brand" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> বা{" "}
        <a className="font-bold text-brand" href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
      </p>
    </StaticPage>
  );
}
