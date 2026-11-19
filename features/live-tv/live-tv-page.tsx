"use client";

import { useLanguage } from "@/providers/language-provider";

export function LiveTvPage() {
  const { lang } = useLanguage();
  const url = process.env.NEXT_PUBLIC_LIVE_TV_URL;
  return <main className="container-page py-8">
    <h1 className="mb-4 text-2xl font-bold">{lang === "bn" ? "লাইভ টিভি" : "Live TV"}</h1>
    {url?.startsWith("https://")
      ? <video className="aspect-video w-full rounded-xl bg-black" src={url} controls playsInline />
      : <p>{lang === "bn" ? "এই মুহূর্তে কোনো সম্প্রচার নেই।" : "No broadcast is available."}</p>}
  </main>;
}
