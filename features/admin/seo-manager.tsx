"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Save, Search, Globe, FileText, Share2 } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/providers/language-provider";

export function SeoManager() {
  const { lang } = useLanguage();
  const [autoIndex, setAutoIndex] = React.useState(true);
  const [sitemap, setSitemap] = React.useState(true);
  const [ogImage, setOgImage] = React.useState(true);
  const [jsonLd, setJsonLd] = React.useState(true);

  const save = () => toast.success(lang === "bn" ? "সেটিংস সংরক্ষিত হয়েছে" : "Settings saved");

  const title = (t: string) => <CardTitle>{t}</CardTitle>;
  const desc = (d: string) => <CardDescription>{d}</CardDescription>;

  return (
    <div className="space-y-6">
      <PageHeader title="SEO Settings" description="Search engine optimization and social sharing" />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Globe className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="content"><FileText className="h-4 w-4" /> Content</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="h-4 w-4" /> Social</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{title(lang === "bn" ? "মূল সেটিংস" : "Core Settings")}{desc("Site-wide SEO defaults")}</CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Default SEO title</Label>
                  <Input id="seo-title" defaultValue="BD24News — Bangladesh's Leading News Portal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-desc">Default meta description</Label>
                  <Input id="seo-desc" defaultValue="Latest Bangladeshi news, sports, economy, technology and more." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input id="seo-keywords" defaultValue="bangladesh news, cricket, economy, technology, sports, dhaka" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>{title("Crawlers & Indexing")}</CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Allow search engine indexing</p>
                  <p className="text-xs text-muted-foreground">Respect robots.txt and allow crawlers</p>
                </div>
                <Switch checked={autoIndex} onCheckedChange={setAutoIndex} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Auto-generate sitemap</p>
                  <p className="text-xs text-muted-foreground">Submit updated sitemap to search engines</p>
                </div>
                <Switch checked={sitemap} onCheckedChange={setSitemap} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Structured data (JSON-LD)</p>
                  <p className="text-xs text-muted-foreground">Emit NewsArticle and Breadcrumb markup</p>
                </div>
                <Switch checked={jsonLd} onCheckedChange={setJsonLd} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{title("Content SEO")}{desc("Per-content-type defaults")}</CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cat-seo">Category pages</Label>
                  <Input id="cat-seo" defaultValue="dynamic" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-seo">Tag pages</Label>
                  <Input id="tag-seo" defaultValue="noindex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-seo">Author pages</Label>
                  <Input id="auth-seo" defaultValue="index" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-canonical">Canonical URL base</Label>
                <Input id="seo-canonical" defaultValue="https://bd24news.vercel.app" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{title("Social Sharing")}{desc("Open Graph and Twitter cards")}</CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Default Open Graph image</p>
                  <p className="text-xs text-muted-foreground">Shown when sharing articles on Facebook/LinkedIn</p>
                </div>
                <Switch checked={ogImage} onCheckedChange={setOgImage} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="og-title">Default OG title</Label>
                <Input id="og-title" defaultValue="BD24News" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og-desc">Default OG description</Label>
                <Textarea id="og-desc" rows={2} defaultValue="Breaking news from Bangladesh and around the world." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-handle">Twitter handle</Label>
                <Input id="twitter-handle" defaultValue="@bd24news" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Button onClick={save}><Save className="h-4 w-4" /> {lang === "bn" ? "সংরক্ষণ করুন" : "Save changes"}</Button>
        <Button variant="outline" onClick={() => toast.success(lang === "bn" ? "পরীক্ষা চলছে…" : "Running crawl test…")}>
          <Search className="h-4 w-4" /> Test crawl
        </Button>
      </div>
    </div>
  );
}
