"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Mail, MapPin, Phone, ShieldCheck, Lock, Cookie } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SocialLinks } from "@/components/shared/social-icons";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { categories, secondaryCategories } from "@/constants/categories";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/providers/language-provider";
import { useScroll } from "@/hooks/use-scroll";
import { toBanglaNumerals } from "@/lib/utils";

const links = [
  { label: "About Us", labelBn: "আমাদের সম্পর্কে", href: "/about" },
  { label: "Contact", labelBn: "যোগাযোগ", href: "/contact" },
  { label: "Advertise", labelBn: "বিজ্ঞাপন", href: "/advertise" },
  { label: "Authors", labelBn: "লেখক", href: "/authors" },
  { label: "Search", labelBn: "অনুসন্ধান", href: "/search" },
];

export function Footer() {
  const { lang, t } = useLanguage();
  const reduce = useReducedMotion();
  const { y } = useScroll();
  const showTop = y > 500;

  const scrollTop = () => {
    if (reduce) {
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-brand/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-accentblue/20 blur-[100px]" />

      <div className="relative container-page py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {siteConfig.description}
            </p>
            <p className="mt-2 font-bengali text-sm font-semibold text-brand-300">
              সত্যের সাথে সবসময় — Always with the truth
            </p>
            <div className="mt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {t("followUs")}
              </p>
              <SocialLinks className="[&_a]:border-white/15 [&_a]:bg-white/5 [&_a]:text-white/70" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bengali text-sm font-bold uppercase tracking-wider text-brand-300">
              {t("categories")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-brand transition-all group-hover:w-3" />
                    {lang === "bn" ? cat.nameBn : cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bengali text-sm font-bold uppercase tracking-wider text-brand-300">
              {t("categories")}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {categories.slice(8).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <span className="h-1 w-1 rounded-full bg-brand transition-all group-hover:w-3" />
                    {lang === "bn" ? cat.nameBn : cat.name}
                  </Link>
                </li>
              ))}
              {secondaryCategories.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
                    <span className="h-1 w-1 rounded-full bg-accentblue transition-all group-hover:w-3" />
                    {s.nameBn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-bengali text-sm font-bold uppercase tracking-wider text-brand-300">
              {t("newsletter")}
            </h4>
            <p className="mt-4 text-sm text-white/60">{t("newsletterDesc")}</p>
            <div className="mt-4">
              <NewsletterForm variant="footer" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-white/60">
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 shrink-0 text-brand-400" />{siteConfig.address}</p>
              <p className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-brand-400" />{siteConfig.email}</p>
              <p className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-brand-400" />{siteConfig.phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-6 text-sm sm:grid-cols-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-2 text-white/60 transition-colors hover:text-white">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              {lang === "bn" ? l.labelBn : l.label}
            </Link>
          ))}
          <Link href="/privacy-policy" className="flex items-center gap-2 text-white/60 transition-colors hover:text-white">
            <Lock className="h-4 w-4 text-brand-400" /> {lang === "bn" ? "গোপনীয়তা" : "Privacy"}
          </Link>
          <Link href="/cookie-policy" className="flex items-center gap-2 text-white/60 transition-colors hover:text-white">
            <Cookie className="h-4 w-4 text-brand-400" /> {lang === "bn" ? "কুকি" : "Cookies"}
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} {t("allRightsReserved")}. {lang === "bn" ? `প্রতিষ্ঠিত ${toBn(siteConfig.establishedYear)}` : `Est. ${siteConfig.establishedYear}`}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white">{lang === "bn" ? "শর্তাবলী" : "Terms"}</Link>
            <Link href="/about" className="hover:text-white">{lang === "bn" ? "সম্পাদকীয় নীতি" : "Editorial Policy"}</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>

      <motion.button
        initial={false}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 20, pointerEvents: showTop ? "auto" : "none" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollTop}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-700 text-white shadow-glow"
        aria-label={t("backToTop")}
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
}

function toBn(n: number): string {
  return toBanglaNumerals(n);
}
