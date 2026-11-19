import type { Metadata } from "next";
import { StaticPage, Copy } from "@/features/static/static-page";
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
      subtitleEn="BD24News — Always with the truth"
      subtitle={`${siteConfig.nameBn} — ${siteConfig.tagline}`}
    >
      <p><Copy en={<>Founded in {siteConfig.establishedYear}, {siteConfig.name} is among Bangladesh’s rapidly growing online news outlets. We believe truth is at the heart of journalism. Our motto is “Always with the truth”.</>}>
        {siteConfig.establishedYear.toLocaleString("bn-BD", { useGrouping: false })} সালে প্রতিষ্ঠিত {siteConfig.nameBn} বাংলাদেশের অন্যতম দ্রুত বর্ধনশীল অনলাইন সংবাদমাধ্যম।
        আমরা বিশ্বাস করি, সত্য হলো সাংবাদিকতার মূল। এই বিশ্বাস থেকেই আমাদের স্লোগান —{" "}
        <strong className="text-brand">সত্যের সাথে সবসময়</strong>।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Our mission</>}>আমাদের লক্ষ্য</Copy></h2>
      <p><Copy en={<>We aim to bring readers accurate, impartial and timely news and analysis from Bangladesh and abroad. We believe informed, constructive journalism helps build a healthy society.</>}>
        দেশ ও বিদেশের গুরুত্বপূর্ণ খবর, বিশ্লেষণ ও তথ্যকে সঠিক, নিরপেক্ষ ও দ্রুততম সময়ে পাঠকের কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য।
        আমরা বিশ্বাস করি তথ্যবহুল ও গঠনমূলক সাংবাদিকতা একটি সুস্থ সমাজ গঠনে গুরুত্বপূর্ণ ভূমিকা রাখে।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Our team</>}>আমাদের দল</Copy></h2>
      <p><Copy en={<>Our journalists, editors, photojournalists and technology specialists work around the clock. We have correspondents in every district and upazila.</>}>
        অভিজ্ঞ সাংবাদিক, সম্পাদক, ফটোসাংবাদিক ও প্রযুক্তি বিশেষজ্ঞদের সমন্বয়ে গঠিত আমাদের দল চব্বিশ ঘণ্টা কাজ করে।
        দেশের প্রতিটি জেলা ও উপজেলায় আমাদের প্রতিনিধি রয়েছেন।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Editorial policy</>}>সম্পাদকীয় নীতি</Copy></h2>
      <p><Copy en={<>We uphold impartial, accurate and responsible journalism. We verify news before publication and give readers’ feedback and complaints our full attention.</>}>
        আমরা নিরপেক্ষ, নির্ভুল ও দায়িত্বশীল সাংবাদিকতার নীতিতে বিশ্বাস করি। যেকোনো সংবাদ প্রকাশের আগে তা যাচাই করা হয়।
        পাঠকের প্রতিক্রিয়া ও অভিযোগকে আমরা সর্বোচ্চ গুরুত্ব দিই।
      </Copy></p>
    </StaticPage>
  );
}
