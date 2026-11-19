import type { Metadata } from "next";
import { StaticPage, Copy } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cookie Policy — কুকি নীতি",
  description: `${siteConfig.name} এর কুকি নীতি।`,
  alternates: { canonical: `${siteConfig.url}/cookie-policy` },
};

export default function CookiePolicyPage() {
  return (
    <StaticPage title="Cookie Policy" titleBn="কুকি নীতি" breadcrumb="কুকি নীতি">
      <p><Copy en={<>This policy explains how {siteConfig.name} uses cookies and similar technologies. Cookies are small text files stored in your browser.</>}>
        এই নীতিটি ব্যাখ্যা করে {siteConfig.name} কীভাবে কুকি ও অনুরূপ প্রযুক্তি ব্যবহার করে। কুকি হলো ছোট টেক্সট ফাইল যা
        আপনার ব্রাউজারে সংরক্ষিত হয়।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Cookies we use</>}>আমরা কোন কুকি ব্যবহার করি</Copy></h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><Copy en={<>Essential cookies support basic site functions.</>}><strong>প্রয়োজনীয় কুকি:</strong> সাইটের মৌলিক কার্যকারিতার জন্য</Copy></li>
        <li><Copy en={<>Preference cookies remember language and theme choices.</>}><strong>পছন্দের কুকি:</strong> ভাষা ও থিম পছন্দ মনে রাখার জন্য</Copy></li>
        <li><Copy en={<>Analytics cookies help us understand traffic and usage.</>}><strong>বিশ্লেষণী কুকি:</strong> ট্রাফিক ও ব্যবহার বুঝতে</Copy></li>
        <li><Copy en={<>Advertising cookies help display relevant ads.</>}><strong>বিজ্ঞাপন কুকি:</strong> প্রাসঙ্গিক বিজ্ঞাপন দেখাতে</Copy></li>
      </ul>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Managing cookies</>}>কুকি নিয়ন্ত্রণ</Copy></h2>
      <p><Copy en={<>You may delete or block cookies at any time in your browser settings. Blocking some cookies may affect how the site works.</>}>
        আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকি মুছে ফেলতে বা ব্লক করতে পারেন। তবে মনে রাখবেন, কিছু কুকি ব্লক করলে
        সাইটের কিছু কার্যকারিতা ব্যাহত হতে পারে।
      </Copy></p>
    </StaticPage>
  );
}
