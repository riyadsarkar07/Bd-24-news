"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Archive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getArchiveYears, getArchivePage } from "@/services/newsService";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/shared/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/providers/language-provider";
import { dhakaDateParts, toBanglaNumerals } from "@/lib/utils";

const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export function ArchivePage() {
  const { lang } = useLanguage();
  const current = String(dhakaDateParts(new Date())!.year);
  const [year, setYear] = React.useState(current);
  const [month, setMonth] = React.useState("all");
  const [page, setPage] = React.useState(0);
  const available = useQuery({ queryKey: ["archive-years"], queryFn: getArchiveYears });
  const years = [...new Set([current, ...(available.data ?? []).map(String)])];
  const { data, isLoading, isError } = useQuery({
    queryKey: ["archive", year, month, page],
    queryFn: () => getArchivePage(Number(year), months.indexOf(month), page),
  });
  const filtered = data?.articles ?? [];
  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "আর্কাইভ" : "Archive" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading title="Archive" titleBn="আর্কাইভ" color="#475569" icon={<Archive className="h-4 w-4" />} />
        <div className="flex gap-2">
          <Select value={year} onValueChange={(v) => { setYear(v); setPage(0); }}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={(v) => { setMonth(v); setPage(0); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "bn" ? "সব মাস" : "All months"}</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isError && !isLoading && <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        {lang === "bn" ? `${toBanglaNumerals((data?.count ?? 0))}টি খবর পাওয়া গেছে` : `${(data?.count ?? 0)} stories found`}
      </p>}

      {isError && <p role="alert">{lang === "bn" ? "আর্কাইভ লোড হয়নি।" : "Archive unavailable."}</p>}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.05 }}
            >
              <ArticleCard article={a} />
            </motion.div>
          ))}
        </div>
      )}
      <div className="mt-6 flex gap-6">
        {page > 0 && <button onClick={() => setPage(page - 1)}>{lang === "bn" ? "আগের পাতা" : "Previous"}</button>}
        {(page + 1) * 24 < (data?.count ?? 0) && <button onClick={() => setPage(page + 1)}>{lang === "bn" ? "পরের পাতা" : "Next"}</button>}
      </div>
    </div>
  );
}
