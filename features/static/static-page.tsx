import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/shared/breadcrumb";

interface StaticPageProps {
  title: string;
  titleBn: string;
  subtitle?: string;
  breadcrumb: string;
  children: ReactNode;
}

export function StaticPage({ title, titleBn, subtitle, breadcrumb, children }: StaticPageProps) {
  return (
    <div className="container-page max-w-4xl py-8">
      <Breadcrumb items={[{ label: breadcrumb }]} />
      <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-brand via-brand-600 to-accentblue p-8 text-white shadow-glow sm:p-10">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative">
          <h1 className="font-bengali text-3xl font-black sm:text-4xl">{titleBn}</h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-white/70">{title}</p>
          {subtitle && <p className="mt-3 max-w-2xl text-sm text-white/80">{subtitle}</p>}
        </div>
      </div>
      <div className="prose-news prose-news-p mt-8">{children}</div>
    </div>
  );
}
