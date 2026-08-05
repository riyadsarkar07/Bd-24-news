"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Coins, DollarSign, Bitcoin, BarChart3 } from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { stockMarket, goldPrices, currencyRates, cryptoPrices } from "@/constants/social";
import { useLanguage } from "@/providers/language-provider";
import { cn, toBanglaNumerals } from "@/lib/utils";

function MarketRow({
  name,
  nameBn,
  price,
  change,
  changePercent,
  symbol,
}: {
  name: string;
  nameBn: string;
  price: number;
  change: number;
  changePercent: number;
  symbol?: string;
}) {
  const { lang } = useLanguage();
  const up = change >= 0;
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/40"
    >
      <td className="px-4 py-3">
        <p className="font-semibold">{lang === "bn" ? nameBn : name}</p>
        {symbol && <p className="text-[11px] text-muted-foreground">{symbol}</p>}
      </td>
      <td className="px-4 py-3 text-right font-mono font-bold">
        {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold", up ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}
          {change}
        </span>
      </td>
      <td className={cn("px-4 py-3 text-right font-bold", up ? "text-success" : "text-danger")}>
        {up ? "+" : ""}
        {changePercent}%
      </td>
    </motion.tr>
  );
}

function MarketTable({ title, titleBn, icon, color, children }: { title: string; titleBn: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
    >
      <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: color }}>
          {icon}
        </span>
        <div>
          <h3 className="font-bengali text-lg font-bold">{titleBn}</h3>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold">Change</th>
              <th className="px-4 py-3 text-right font-semibold">%</th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </motion.section>
  );
}

export function MarketsPage() {
  const { lang } = useLanguage();
  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "বাজার" : "Markets" }]} />
      <div className="mt-4">
        <SectionHeading title="Markets Overview" titleBn="বাজার পরিস্থিতি" color="#059669" icon={<BarChart3 className="h-4 w-4" />} />
      </div>
      <div className="space-y-8">
        <MarketTable title="Stock Market" titleBn="শেয়ারবাজার" color="#2563EB" icon={<TrendingUp className="h-4 w-4" />}>
          {stockMarket.map((s) => (
            <MarketRow key={s.symbol} name={s.name} nameBn={s.nameBn} price={s.price} change={s.change} changePercent={s.changePercent} symbol={s.symbol} />
          ))}
        </MarketTable>

        <MarketTable title="Gold & Silver" titleBn="সোনা ও রূপা" color="#F59E0B" icon={<Coins className="h-4 w-4" />}>
          {goldPrices.map((g) => (
            <MarketRow key={g.name} name={g.name} nameBn={g.nameBn} price={g.price} change={g.change} changePercent={g.changePercent} />
          ))}
        </MarketTable>

        <MarketTable title="Currency Exchange" titleBn="মুদ্রা বিনিময়" color="#22C55E" icon={<DollarSign className="h-4 w-4" />}>
          {currencyRates.map((c) => (
            <MarketRow key={c.code} name={c.name} nameBn={c.nameBn} price={c.price} change={c.change} changePercent={c.changePercent} symbol={c.code} />
          ))}
        </MarketTable>

        <MarketTable title="Cryptocurrency" titleBn="ক্রিপ্টোকারেন্সি" color="#F97316" icon={<Bitcoin className="h-4 w-4" />}>
          {cryptoPrices.map((c) => (
            <MarketRow key={c.symbol} name={c.name} nameBn={c.nameBn} price={c.price} change={c.change} changePercent={c.changePercent} symbol={c.symbol} />
          ))}
        </MarketTable>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {lang === "bn" ? "দ্রষ্টব্য: এই তথ্য তথ্যসূত্র হিসেবে ব্যবহৃত, বিনিয়োগের পরামর্শ নয়।" : "Note: Market data is for reference only, not investment advice."}
      </p>
    </div>
  );
}
