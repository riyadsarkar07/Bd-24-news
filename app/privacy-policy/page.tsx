import type { Metadata } from "next";
import { StaticPage } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy — গোপনীয়তা নীতি",
  description: `${siteConfig.name} এর গোপনীয়তা নীতি।`,
  alternates: { canonical: `${siteConfig.url}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Privacy Policy" titleBn="গোপনীয়তা নীতি" breadcrumb="গোপনীয়তা নীতি">
      <p>
        {siteConfig.name} আপনার ব্যক্তিগত গোপনীয়তাকে গুরুত্বের সাথে বিবেচনা করে। এই নীতি আমাদের ওয়েবসাইট ব্যবহারের সময়
        আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সংরক্ষণ করি তা ব্যাখ্যা করে।
      </p>
      <h2 className="mt-8 font-bengali text-2xl font-bold">আমরা যে তথ্য সংগ্রহ করি</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>ব্রাউজার, ডিভাইস ও আইপি ঠিকানার মতো প্রযুক্তিগত তথ্য</li>
        <li>নিউজলেটার সাবস্ক্রিপশনের জন্য ইমেইল ঠিকানা</li>
        <li>মন্তব্য প্রকাশের সময় প্রদত্ত নাম</li>
        <li>কুকিজের মাধ্যমে ব্যবহারকারীর পছন্দ</li>
      </ul>
      <h2 className="mt-8 font-bengali text-2xl font-bold">তথ্য ব্যবহার</h2>
      <p>
        সংগৃহীত তথ্য আমরা ব্যবহার করি কনটেন্ট উন্নত করতে, ব্যক্তিগতকৃত অভিজ্ঞতা দিতে এবং বিশ্লেষণের জন্য।
        আমরা কখনোই আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।
      </p>
      <h2 className="mt-8 font-bengali text-2xl font-bold">কুকি</h2>
      <p>
        আমরা ওয়েবসাইটের কার্যকারিতা ও বিশ্লেষণের জন্য কুকি ব্যবহার করি। বিস্তারিত জানতে আমাদের কুকি নীতিটি দেখুন।
        আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকি নিয়ন্ত্রণ করতে পারেন।
      </p>
      <h2 className="mt-8 font-bengali text-2xl font-bold">আপনার অধিকার</h2>
      <p>
        যেকোনো সময় আপনি আমাদের কাছে সংরক্ষিত আপনার তথ্য দেখতে, সংশোধন করতে বা মুছে ফেলতে অনুরোধ করতে পারেন।
        যোগাযোগ: <a className="font-bold text-brand" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </p>
    </StaticPage>
  );
}
