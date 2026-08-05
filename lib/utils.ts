import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNowStrict } from "date-fns";
import { bn } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, opts: { locale?: "en" | "bn" } = {}): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (opts.locale === "bn") {
    return toBanglaNumerals(format(d, "do MMMM yyyy", { locale: bn }));
  }
  return format(d, "do MMMM yyyy");
}

export function formatDateTime(date: string | Date, opts: { locale?: "en" | "bn" } = {}): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (opts.locale === "bn") {
    return toBanglaNumerals(format(d, "do MMMM yyyy, h:mm a", { locale: bn }));
  }
  return format(d, "do MMMM yyyy, h:mm a");
}

export function timeAgo(date: string | Date, locale: "en" | "bn" = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const str = formatDistanceToNowStrict(d, { addSuffix: true, locale: locale === "bn" ? bn : undefined });
  return locale === "bn" ? toBanglaNumerals(str) : str;
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
