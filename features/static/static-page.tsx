"use client";

import { useLanguage } from "@/providers/language-provider";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/shared/breadcrumb";

interface StaticPageProps {
  title: string;
  titleBn: string;
  subtitle?: string;
  subtitleEn?: string;
  breadcrumb: string;
  children: ReactNode;
}

export function StaticPage({ title, titleBn, subtitle, subtitleEn, breadcrumb, children }: StaticPageProps) {
  const { lang } = useLanguage();
  return (
    <div className="container-page max-w-4xl py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? breadcrumb : title }]} />
      <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-brand via-brand-600 to-accentblue p-8 text-white shadow-glow sm:p-10">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative">
          <h1 className="font-bengali text-3xl font-black sm:text-4xl">{lang === "bn" ? titleBn : title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-sm text-white/80">{lang === "bn" ? subtitle : subtitleEn}</p>}
        </div>
      </div>
      <div className="prose-news prose-news-p mt-8">{children}</div>
    </div>
  );
}

export function Copy({ en, children }: { en: ReactNode; children: ReactNode }) {
  return useLanguage().lang === "en" ? en : children;
}
