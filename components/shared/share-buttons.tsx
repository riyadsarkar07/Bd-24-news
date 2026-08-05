"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  Facebook,
  Twitter,
  Send,
  MessageCircle,
  Mail,
  Link2,
  QrCode,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCode } from "@/components/shared/qr-code";
import { useLanguage } from "@/providers/language-provider";

interface ShareButtonsProps {
  title: string;
  url: string;
  variant?: "default" | "sticky";
}

export function ShareButtons({ title, url, variant = "default" }: ShareButtonsProps) {
  const { lang } = useLanguage();
  const [copied, setCopied] = React.useState(false);
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(lang === "bn" ? "লিংক কপি হয়েছে" : "Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(lang === "bn" ? "কপি ব্যর্থ" : "Copy failed");
    }
  };

  const buttons = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`, icon: Facebook, color: "#1877F2" },
    { label: "Twitter / X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`, icon: Twitter, color: "#000000" },
    { label: "WhatsApp", href: `https://api.whatsapp.com/send?text=${text}%20${encoded}`, icon: MessageCircle, color: "#25D366" },
    { label: "Telegram", href: `https://t.me/share/url?url=${encoded}&text=${text}`, icon: Send, color: "#26A5E4" },
    { label: "Email", href: `mailto:?subject=${text}&body=${encoded}`, icon: Mail, color: "#64748B" },
  ];

  return (
    <div className={variant === "sticky" ? "flex flex-col items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      {buttons.map((b) => (
        <Button
          key={b.label}
          asChild
          size="icon"
          variant="outline"
          className="hover:-translate-y-0.5 hover:border-transparent hover:text-white"
          style={{ ["--tw-shadow-color" as string]: b.color }}
          onMouseEnter={(e) => (e.currentTarget.style.background = b.color)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          aria-label={`Share on ${b.label}`}
        >
          <a href={b.href} target="_blank" rel="noopener noreferrer">
            <b.icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
      <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy link">
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="QR code">
            <QrCode className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-56 flex-col items-center gap-2">
          <QRCode value={url} />
          <p className="text-xs text-muted-foreground">{lang === "bn" ? "স্ক্যান করুন" : "Scan to share"}</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
