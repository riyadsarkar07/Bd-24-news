import type { Metadata } from "next";
import { StaticPage, Copy } from "@/features/static/static-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service — ব্যবহারের শর্তাবলী",
  description: `${siteConfig.nameBn} এর ব্যবহারের শর্তাবলী।`,
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Service" titleBn="ব্যবহারের শর্তাবলী" breadcrumb="শর্তাবলী">
      <p><Copy en={<>Please read these terms before using {siteConfig.name}. By using the website, you accept the following conditions.</>}>
        {siteConfig.nameBn} ওয়েবসাইট ব্যবহারের পূর্বে এই শর্তাবলী মনোযোগ সহকারে পড়ুন। এই সাইট ব্যবহার করার অর্থ আপনি নিচের
        শর্তগুলো মেনে নিচ্ছেন।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Use of content</>}>বিষয়বস্তুর ব্যবহার</Copy></h2>
      <p><Copy en={<>Our reporting is based on information we seek to keep accurate and impartial. We accept no liability for factual errors. You need written permission to republish content commercially.</>}>
        আমাদের প্রকাশিত সংবাদ ও কনটেন্ট সঠিক ও নিরপেক্ষ তথ্যের উপর ভিত্তি করে তৈরি। তবে কোনো তথ্য ত্রুটির জন্য দায়ী করা
        যাবে না। কনটেন্ট বাণিজ্যিকভাবে পুনরায় প্রকাশ করতে আমাদের লিখিত অনুমতি প্রয়োজন।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Comments and user content</>}>মন্তব্য ও ব্যবহারকারী কনটেন্ট</Copy></h2>
      <p><Copy en={<>We expect lawful, civil and respectful conduct when commenting. We reserve the right to publish comments that are defamatory, obscene or unlawful.</>}>
        মন্তব্য প্রকাশের সময় আপনি আইনসম্মত, সভ্য ও সম্মানজনক আচরণ করবেন বলে আশা করা হয়। মানহানিকর, অশ্লীল বা আইনবিরোধী
        মন্তব্য প্রকাশের অধিকার আমরা সংরক্ষণ করি।
      </Copy></p>
      <h2 className="mt-8 font-bengali text-2xl font-bold"><Copy en={<>Limitation of liability</>}>দায়বদ্ধতার সীমাবদ্ধতা</Copy></h2>
      <p><Copy en={<>Despite our best efforts, we accept no liability for losses arising from temporary unavailability or factual errors.</>}>
        আমাদের সর্বোচ্চ চেষ্টা থাকা সত্ত্বেও ওয়েবসাইটের সাময়িক অনুপলব্ধতা বা তথ্যগত ভুলের ফলে সৃষ্ট ক্ষতির জন্য আমরা
        দায়ী নই।
      </Copy></p>
      <p className="mt-6"><Copy en={<>For questions about these terms, contact <a href={'mailto:' + siteConfig.email}>{siteConfig.email}</a>.</>}>
        শর্তাবলী সম্পর্কে প্রশ্ন থাকলে যোগাযোগ করুন: <a className="font-bold text-brand" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </Copy></p>
    </StaticPage>
  );
}
