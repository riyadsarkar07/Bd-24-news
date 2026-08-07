"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, BadgeCheck, Newspaper } from "lucide-react";
import { getAuthors } from "@/services/newsService";
import type { Author } from "@/types";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/providers/language-provider";
import { formatNumber } from "@/lib/utils";

export function AuthorsPage() {
  const { lang } = useLanguage();
  const [authors, setAuthors] = React.useState<Author[] | null>(null);

  React.useEffect(() => {
    getAuthors().then(setAuthors).catch(() => setAuthors([]));
  }, []);

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "লেখকবৃন্দ" : "Authors" }]} />
      <div className="mt-4">
        <SectionHeading title="Authors" titleBn="লেখকবৃন্দ" color="#7C3AED" icon={<Users className="h-4 w-4" />} />
      </div>

      {authors === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : authors.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{lang === "bn" ? "কোনো লেখক পাওয়া যায়নি" : "No authors found"}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((a, i) => (
            <motion.div
              key={a.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/authors/${a.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <div className="relative h-28 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-brand/60">
                  <div className="bg-grid absolute inset-0 opacity-30" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {a.cover && <img src={a.cover} alt="" className="h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" />}
                </div>
                <div className="-mt-10 px-5 pb-5 text-center">
                  <Avatar className="mx-auto h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarImage src={a.avatar} alt={a.name} />
                    <AvatarFallback className="bg-brand text-white">{(a.name || a.nameBn || "?").slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 flex items-center justify-center gap-1.5 font-bengali text-lg font-bold">
                    {a.nameBn || a.name}
                    {a.verified && <BadgeCheck className="h-4 w-4 text-accentblue" />}
                  </h3>
                  <p className="text-xs font-semibold text-brand">{a.role}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{a.bio}</p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Newspaper className="h-3.5 w-3.5" />
                      {formatNumber(a.articlesCount, lang)} {lang === "bn" ? "লেখা" : "stories"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {formatNumber(a.followers, lang)} {lang === "bn" ? "অনুসারী" : "followers"}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
