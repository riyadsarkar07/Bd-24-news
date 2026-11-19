import type { Metadata } from "next";
import { StaticPage, Copy } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy — গোপনীয়তা নীতি",
  description: `${siteConfig.nameBn} এর গোপনীয়তা নীতি।`,
  alternates: { canonical: `${siteConfig.url}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Privacy Policy" titleBn="গোপনীয়তা নীতি" breadcrumb="গোপনীয়তা নীতি">
      <p><Copy en={<>{siteConfig.name} takes your privacy seriously. This policy explains how we collect, use and store information when you use our website.</>}>
        {siteConfig.nameBn} আপনার ব্যক্তিগত গোপনীয়তাকে গুরুত্বের সাথে বিবেচনা করে। এই নীতি আমাদের ওয়েবসাইট ব্যবহারের সময়
        আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সংরক্ষণ করি তা ব্যাখ্যা করে।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Information we collect</>}>আমরা যে তথ্য সংগ্রহ করি</Copy></h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><Copy en={<>Technical details such as your browser, device and IP address</>}>ব্রাউজার, ডিভাইস ও আইপি ঠিকানার মতো প্রযুক্তিগত তথ্য</Copy></li>
        <li><Copy en={<>Your email address when you subscribe to the newsletter</>}>নিউজলেটার সাবস্ক্রিপশনের জন্য ইমেইল ঠিকানা</Copy></li>
        <li><Copy en={<>The name you provide when commenting</>}>মন্তব্য প্রকাশের সময় প্রদত্ত নাম</Copy></li>
        <li><Copy en={<>Preferences stored through cookies</>}>কুকিজের মাধ্যমে ব্যবহারকারীর পছন্দ</Copy></li>
      </ul>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>How we use information</>}>তথ্য ব্যবহার</Copy></h2>
      <p><Copy en={<>We use this information to improve content, personalize your experience and understand how the site is used. We never sell your information to third parties.</>}>
        সংগৃহীত তথ্য আমরা ব্যবহার করি কনটেন্ট উন্নত করতে, ব্যক্তিগতকৃত অভিজ্ঞতা দিতে এবং বিশ্লেষণের জন্য।
        আমরা কখনোই আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Cookies</>}>কুকি</Copy></h2>
      <p><Copy en={<>We use cookies for site functionality and analytics. See our cookie policy for details. You can manage cookies in your browser settings at any time.</>}>
        আমরা ওয়েবসাইটের কার্যকারিতা ও বিশ্লেষণের জন্য কুকি ব্যবহার করি। বিস্তারিত জানতে আমাদের কুকি নীতিটি দেখুন।
        আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকি নিয়ন্ত্রণ করতে পারেন।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Your rights</>}>আপনার অধিকার</Copy></h2>
      <p><Copy en={<>You may ask us to show, correct or delete information we hold about you. Contact <a href={'mailto:' + siteConfig.email}>{siteConfig.email}</a>.</>}>
        যেকোনো সময় আপনি আমাদের কাছে সংরক্ষিত আপনার তথ্য দেখতে, সংশোধন করতে বা মুছে ফেলতে অনুরোধ করতে পারেন।
        যোগাযোগ: <a className="font-bold text-brand" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </Copy></p>
    </StaticPage>
  );
}
