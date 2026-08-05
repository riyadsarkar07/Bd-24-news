import type { Metadata } from "next";
import { StaticPage } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us — আমাদের সম্পর্কে",
  description: `বিডি২৪নিউজ সম্পর্কে জানুন। ${siteConfig.description}`,
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About Us"
      titleBn="আমাদের সম্পর্কে"
      breadcrumb="আমাদের সম্পর্কে"
      subtitle={`${siteConfig.name} — ${siteConfig.tagline}`}
    >
      <p>
        {siteConfig.establishedYear} সালে প্রতিষ্ঠিত {siteConfig.name} বাংলাদেশের অন্যতম দ্রুত বর্ধনশীল অনলাইন সংবাদমাধ্যম।
        আমরা বিশ্বাস করি, সত্য হলো সাংবাদিকতার মূল। এই বিশ্বাস থেকেই আমাদের স্লোগান —{" "}
        <strong className="text-brand">সত্যের সাথে সবসময়</strong>।
      </p>
      <h2 className="mt-8 font-bengali text-2xl font-bold">আমাদের লক্ষ্য</h2>
      <p>
        দেশ ও বিদেশের গুরুত্বপূর্ণ খবর, বিশ্লেষণ ও তথ্যকে সঠিক, নিরপেক্ষ ও দ্রুততম সময়ে পাঠকের কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য।
        আমরা বিশ্বাস করি তথ্যবহুল ও গঠনমূলক সাংবাদিকতা একটি সুস্থ সমাজ গঠনে গুরুত্বপূর্ণ ভূমিকা রাখে।
      </p>
      <h2 className="mt-8 font-bengali text-2xl font-bold">আমাদের দল</h2>
      <p>
        অভিজ্ঞ সাংবাদিক, সম্পাদক, ফটোসাংবাদিক ও প্রযুক্তি বিশেষজ্ঞদের সমন্বয়ে গঠিত আমাদের দল চব্বিশ ঘণ্টা কাজ করে।
        দেশের প্রতিটি জেলা ও উপজেলায় আমাদের প্রতিনিধি রয়েছেন।
      </p>
      <h2 className="mt-8 font-bengali text-2xl font-bold">সম্পাদকীয় নীতি</h2>
      <p>
        আমরা নিরপেক্ষ, নির্ভুল ও দায়িত্বশীল সাংবাদিকতার নীতিতে বিশ্বাস করি। যেকোনো সংবাদ প্রকাশের আগে তা যাচাই করা হয়।
        পাঠকের প্রতিক্রিয়া ও অভিযোগকে আমরা সর্বোচ্চ গুরুত্ব দিই।
      </p>
    </StaticPage>
  );
}
