"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CloudSun, Droplets, Wind, Sun, CloudRain, CloudLightning } from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { weatherData } from "@/constants/widgets";
import { useLanguage } from "@/providers/language-provider";
import { toBanglaNumerals } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  sunny: <Sun className="h-8 w-8 text-warning" />,
  "partly-cloudy": <CloudSun className="h-8 w-8 text-warning" />,
  rainy: <CloudRain className="h-8 w-8 text-accentblue" />,
  thunderstorm: <CloudLightning className="h-8 w-8 text-brand" />,
};

export function WeatherPage() {
  const { lang } = useLanguage();

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: lang === "bn" ? "আবহাওয়া" : "Weather" }]} />
      <div className="mt-4">
        <SectionHeading title="Weather Forecast" titleBn="আবহাওয়ার পূর্বাভাস" color="#0EA5E9" icon={<CloudSun className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {weatherData.map((w, i) => (
          <motion.div
            key={w.city}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accentblue/10 blur-2xl" />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bengali text-lg font-bold">{w.cityBn}</h3>
                <p className="text-xs text-muted-foreground">{w.city}</p>
              </div>
              {iconMap[w.icon] ?? iconMap["partly-cloudy"]}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-bengali text-5xl font-black">{toBanglaNumerals(w.temp)}°</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {lang === "bn" ? w.conditionBn : w.condition}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lang === "bn" ? `সর্বোচ্চ ${toBanglaNumerals(w.high)}° · সর্বনিম্ন ${toBanglaNumerals(w.low)}°` : `H ${w.high}° · L ${w.low}°`}
                </p>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-accentblue" />{toBanglaNumerals(w.humidity)}%</p>
                <p className="flex items-center gap-1.5"><Wind className="h-3.5 w-3.5 text-accentblue" />{toBanglaNumerals(w.wind)} km/h</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-card">
        <h3 className="font-bengali text-lg font-bold">{lang === "bn" ? "আবহাওয়া সতর্কতা" : "Weather Alert"}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {lang === "bn"
            ? "উপকূলীয় জেলাগুলোতে মাঝারি থেকে ভারী বৃষ্টিপাতের সম্ভাবনা রয়েছে। নদীবন্দরগুলোকে ১ নম্বর সতর্ক সংকেত দেখাতে বলা হয়েছে। ঢাকা ও আশপাশের এলাকায় আজ দিনের তাপমাত্রা ৩৩ ডিগ্রি সেলসিয়াস পর্যন্ত পৌঁছাতে পারে।"
            : "Coastal districts may experience moderate to heavy rainfall. River ports have been advised to hoist cautionary signal No. 1. Temperatures in Dhaka may reach 33°C today."}
        </p>
      </div>
    </div>
  );
}
