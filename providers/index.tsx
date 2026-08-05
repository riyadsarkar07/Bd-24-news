"use client";

import * as React from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SearchProvider } from "@/providers/search-provider";
import { TopBar } from "@/components/layout/top-bar";
import { Header } from "@/components/layout/header";
import { MegaNav } from "@/components/layout/mega-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { NewsTicker } from "@/components/shared/news-ticker";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <ThemeProvider>
      <QueryProvider>
        <LanguageProvider>
          <SearchProvider>
            <div className="relative flex min-h-screen flex-col bg-background text-foreground">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
              >
                Skip to main content
              </a>
              <TopBar />
              <Header onOpenMobile={() => setMobileOpen(true)} />
              <MegaNav />
              <NewsTicker />
              <div id="main-content" className="flex-1">
                {children}
              </div>
              <Footer />
              <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
              <Toaster
                position="top-right"
                toastOptions={{
                  className: "!rounded-xl !bg-background !text-foreground !border !border-border",
                  duration: 3500,
                }}
              />
            </div>
          </SearchProvider>
        </LanguageProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
