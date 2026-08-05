"use client";

import * as React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { Mail, Users, Newspaper, BellRing } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export function NewsletterCTA() {
  const { lang } = useLanguage();
  const stats = [
    { icon: Users, value: 2400000, suffix: "+", label: lang === "bn" ? "ফেসবুক ফলোয়ার" : "Facebook followers" },
    { icon: Newspaper, value: 185000, suffix: "+", label: lang === "bn" ? "দৈনিক পাঠক" : "Daily readers" },
    { icon: BellRing, value: 320, suffix: "+", label: lang === "bn" ? "দৈনিক খবর" : "Stories per day" },
  ];

  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-brand/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-accentblue/20 blur-[100px]" />

      <div className="relative container-page grid items-center gap-10 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-glow">
              <Mail className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-bengali text-3xl font-black leading-tight sm:text-4xl">
              {lang === "bn" ? "প্রতিদিনের খবর, আপনার ইমেইলে" : "The daily briefing, in your inbox"}
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/60">
              {lang === "bn"
                ? "সকাল ৮টায় সবার আগে আজকের গুরুত্বপূর্ণ খবর পান। ফ্রি, স্প্যাম মুক্ত, যেকোনো সময় বাতিল করুন।"
                : "Get the day's most important stories at 8am, before anyone else. Free, spam-free, unsubscribe anytime."}
            </p>
          </motion.div>
          <ScrollReveal delay={0.15}>
            <div className="mt-7 grid max-w-md grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 p-3 text-center backdrop-blur">
                  <s.icon className="mx-auto h-5 w-5 text-brand-400" />
                  <p className="mt-1 font-bengali text-xl font-black text-white">
                    <CountUp end={s.value} duration={2.2} separator="," />
                    {s.suffix}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.1}>
          <div className="glass-card rounded-3xl !border-white/10 !bg-white/5 p-8">
            <NewsletterForm variant="footer" />
            <p className="mt-4 text-center text-xs text-white/40">
              {lang === "bn" ? "সাবস্ক্রাইব করেই জানুন সত্যের সাথে সবসময়" : "Subscribe to always stay with the truth"}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
