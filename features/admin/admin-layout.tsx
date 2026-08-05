"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Tags,
  Users,
  Image as ImageIcon,
  Megaphone,
  MessageSquare,
  Mail,
  ShieldCheck,
  Settings,
  Search,
  BarChart3,
  DatabaseBackup,
  UserRound,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

const nav = [
  { group: "Main", items: [
    { href: "/admin", label: "Dashboard", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
  ]},
  { group: "Content", items: [
    { href: "/admin/news", label: "News", labelBn: "সংবাদ", icon: Newspaper },
    { href: "/admin/categories", label: "Categories", labelBn: "বিভাগ", icon: FolderTree },
    { href: "/admin/tags", label: "Tags", labelBn: "ট্যাগ", icon: Tags },
    { href: "/admin/authors", label: "Authors", labelBn: "লেখক", icon: Users },
    { href: "/admin/media", label: "Media", labelBn: "মিডিয়া", icon: ImageIcon },
  ]},
  { group: "Engagement", items: [
    { href: "/admin/ads", label: "Advertisements", labelBn: "বিজ্ঞাপন", icon: Megaphone },
    { href: "/admin/comments", label: "Comments", labelBn: "মন্তব্য", icon: MessageSquare },
    { href: "/admin/newsletter", label: "Newsletter", labelBn: "নিউজলেটার", icon: Mail },
    { href: "/admin/subscribers", label: "Subscribers", labelBn: "সাবস্ক্রাইবার", icon: Users },
  ]},
  { group: "System", items: [
    { href: "/admin/users", label: "Users", labelBn: "ব্যবহারকারী", icon: Users },
    { href: "/admin/roles", label: "Roles", labelBn: "ভূমিকা", icon: ShieldCheck },
    { href: "/admin/seo", label: "SEO", labelBn: "এসইও", icon: Search },
    { href: "/admin/analytics", label: "Analytics", labelBn: "অ্যানালিটিক্স", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", labelBn: "সেটিংস", icon: Settings },
    { href: "/admin/backup", label: "Backup & Restore", labelBn: "ব্যাকআপ", icon: DatabaseBackup },
  ]},
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b px-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <Logo compact />}
        <Button variant="ghost" size="icon-sm" onClick={() => setCollapsed((v) => !v)} className="hidden lg:inline-flex" aria-label="Collapse sidebar">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {nav.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{group.group}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                    isActive(item.href)
                      ? "bg-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{lang === "bn" ? item.labelBn : item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-3">
        <Link
          href="/admin/profile"
          className={cn("flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted", collapsed && "justify-center")}
        >
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-gradient-to-br from-brand to-accentblue text-white">এড</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">সিটিং অ্যাডমিন</span>
              <span className="block text-[11px] text-muted-foreground">Administrator</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem("bd24news_user");
            router.push("/");
          }}
          className={cn("mt-1 flex w-full items-center gap-3 rounded-xl p-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger", collapsed && "justify-center")}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>{lang === "bn" ? "লগআউট" : "Logout"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30 dark:bg-navy-950/60">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-background transition-all duration-300 lg:block",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        {SidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-2xl lg:hidden"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-full p-1.5 hover:bg-muted" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <p className="font-bengali text-sm font-bold">
              {lang === "bn" ? "অ্যাডমিন প্যানেল" : "Admin Panel"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden text-xs font-semibold text-muted-foreground transition-colors hover:text-brand sm:block">
              ← {lang === "bn" ? "সাইট দেখুন" : "View site"}
            </Link>
            <ThemeToggle />
            <Link href="/admin/profile">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-gradient-to-br from-brand to-accentblue text-white">এড</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
