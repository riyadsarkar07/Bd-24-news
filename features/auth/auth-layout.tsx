"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function AuthLayout({ title, titleBn, subtitle, children, footer }: { title: string; titleBn: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-accentblue/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8">
          <div className="flex flex-col items-center text-center">
            <Logo compact />
            <h1 className="mt-4 font-bengali text-2xl font-black">{titleBn}</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-border/60 pt-5 text-center text-sm text-muted-foreground">{footer}</div>}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>256-bit SSL encrypted connection</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
