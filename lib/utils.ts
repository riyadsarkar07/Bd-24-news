import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNowStrict } from "date-fns";
import { bn } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Everything shown to readers is rendered in Bangladesh Standard Time. */
export const SITE_TIME_ZONE = "Asia/Dhaka";

function toValidDate(date: string | Date): Date | null {
  if (date === "" || date === null || date === undefined) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? null : d;
}

function dhakaHour24(date: Date): number {
  const value = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TIME_ZONE,
    hour: "2-digit",
    hour12: false,
  }).format(date);
  return Number(value) % 24;
}

function bnDayPart(hour: number): string {
  if (hour >= 4 && hour < 6) return "ভোর";
  if (hour >= 6 && hour < 12) return "সকাল";
  if (hour >= 12 && hour < 16) return "দুপুর";
  if (hour >= 16 && hour < 18) return "বিকেল";
  if (hour >= 18 && hour < 20) return "সন্ধ্যা";
  return "রাত";
}

export function formatDate(date: string | Date, opts: { locale?: "en" | "bn" } = {}): string {
  const d = toValidDate(date);
  if (!d) return "";
  return new Intl.DateTimeFormat(opts.locale === "bn" ? "bn-BD" : "en-GB", {
    timeZone: SITE_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date, opts: { locale?: "en" | "bn" } = {}): string {
  const d = toValidDate(date);
  if (!d) return "";
  const locale = opts.locale === "bn" ? "bn-BD" : "en-GB";
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone: SITE_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const datePart = `${part("day")} ${part("month")} ${part("year")}`;
  const timePart = `${part("hour")}:${part("minute")}`;
  if (opts.locale === "bn") {
    return `${datePart}, ${bnDayPart(dhakaHour24(d))} ${timePart}`;
  }
  const period = part("dayPeriod").toLowerCase();
  return `${datePart}, ${timePart} ${period}`;
}

export function timeAgo(date: string | Date, locale: "en" | "bn" = "en"): string {
  const d = toValidDate(date);
  if (!d) return "";
  const str = formatDistanceToNowStrict(d, { addSuffix: true, locale: locale === "bn" ? bn : undefined });
  return locale === "bn" ? toBanglaNumerals(str) : str;
}

/** Year and zero-based month as observed in Asia/Dhaka. */
export function dhakaDateParts(date: string | Date): { year: number; month: number; day: number } | null {
  const d = toValidDate(date);
  if (!d) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d);
  const num = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return { year: num("year"), month: num("month") - 1, day: num("day") };
}

const BN_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

export function toBanglaNumerals(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[d] ?? d);
}

export function readingTime(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatNumber(n: number, locale: "en" | "bn" = "en"): string {
  const formatted = n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  return locale === "bn" ? toBanglaNumerals(formatted) : formatted;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getImagePath(path: string | undefined | null): string {
  if (!path) return "/images/placeholder.svg";
  return path;
}

export function shareUrl(url: string): { facebook: string; whatsapp: string; telegram: string; twitter: string; email: string } {
  const encoded = encodeURIComponent(url);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
    telegram: `https://t.me/share/url?url=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?url=${encoded}`,
    email: `mailto:?subject=BD24News&body=${encoded}`,
  };
}
