import type { Metadata } from "next";
import { StaticPage } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cookie Policy — কুকি নীতি",
  description: `${siteConfig.name} এর কুকি নীতি।`,
  alternates: { canonical: `${siteConfig.url}/cookie-policy` },
};

export default function CookiePolicyPage() {
  return (
    <StaticPage title="Cookie Policy" titleBn="কুকি নীতি" breadcrumb="কুকি নীতি">
      <p>
        এই নীতিটি ব্যাখ্যা করে {siteConfig.name} কীভাবে কুকি ও অনুরূপ প্রযুক্তি ব্যবহার করে। কুকি হলো ছোট টেক্সট ফাইল যা
        আপনার ব্রাউজারে সংরক্ষিত হয়।
      </p>
      <h2 className="mt-8 font-bengali text-2xl font-bold">আমরা কোন কুকি ব্যবহার করি</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><strong>প্রয়োজনীয় কুকি:</strong> সাইটের মৌলিক কার্যকারিতার জন্য</li>
        <li><strong>পছন্দের কুকি:</strong> ভাষা ও থিম পছন্দ মনে রাখার জন্য</li>
        <li><strong>বিশ্লেষণী কুকি:</strong> ট্রাফিক ও ব্যবহার বুঝতে</li>
        <li><strong>বিজ্ঞাপন কুকি:</strong> প্রাসঙ্গিক বিজ্ঞাপন দেখাতে</li>
      </ul>
      <h2 className="mt-8 font-bengali text-2xl font-bold">কুকি নিয়ন্ত্রণ</h2>
      <p>
        আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকি মুছে ফেলতে বা ব্লক করতে পারেন। তবে মনে রাখবেন, কিছু কুকি ব্লক করলে
        সাইটের কিছু কার্যকারিতা ব্যাহত হতে পারে।
      </p>
    </StaticPage>
  );
}
