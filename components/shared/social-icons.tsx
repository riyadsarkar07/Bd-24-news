import {
  Facebook,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { socialLinks } from "@/constants/social";

const iconMap = {
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: TikTokIcon,
  twitter: Twitter,
  linkedin: Linkedin,
  send: Send,
  "message-circle": MessageCircle,
} as const;

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-4 w-4", className)}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function SocialIcon({ id, className }: { id: string; className?: string }) {
  const Icon = iconMap[id as keyof typeof iconMap];
  if (!Icon) return null;
  return <Icon className={cn("h-4 w-4", className)} />;
}

export function SocialLinks({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-11 w-11" };
  const iconSizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {socialLinks.map((s) => (
        <a
          key={s.id}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className={cn(
            "group inline-flex items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-lg",
            sizes[size],
          )}
          style={{ ["--tw-shadow-color" as string]: s.color }}
          onMouseEnter={(e) => (e.currentTarget.style.background = s.color)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <SocialIcon id={s.icon} className={iconSizes[size]} />
        </a>
      ))}
    </div>
  );
}
