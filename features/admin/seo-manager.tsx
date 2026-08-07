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
import { getSeoSettings, saveSeoSettings, DEFAULT_SEO, type SeoSettings } from "@/services/settingsService";

export function SeoManager() {
  const { lang } = useLanguage();
  const [seo, setSeo] = React.useState<SeoSettings>(DEFAULT_SEO);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSeoSettings().then(setSeo).catch(() => setSeo(DEFAULT_SEO));
  }, []);

  const set = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => setSeo((s) => ({ ...s, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await saveSeoSettings(seo);
      toast.success(lang === "bn" ? "সেটিংস সংরক্ষিত হয়েছে" : "Settings saved");
    } catch {
      toast.error(lang === "bn" ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

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
                  <Input id="seo-title" value={seo.defaultTitle} onChange={(e) => set("defaultTitle", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-desc">Default meta description</Label>
                  <Input id="seo-desc" value={seo.defaultDescription} onChange={(e) => set("defaultDescription", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input id="seo-keywords" value={seo.keywords} onChange={(e) => set("keywords", e.target.value)} />
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
                <Switch checked={seo.allowIndexing} onCheckedChange={(v) => set("allowIndexing", v)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Auto-generate sitemap</p>
                  <p className="text-xs text-muted-foreground">Submit updated sitemap to search engines</p>
                </div>
                <Switch checked={seo.autoSitemap} onCheckedChange={(v) => set("autoSitemap", v)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Structured data (JSON-LD)</p>
                  <p className="text-xs text-muted-foreground">Emit NewsArticle and Breadcrumb markup</p>
                </div>
                <Switch checked={seo.jsonLd} onCheckedChange={(v) => set("jsonLd", v)} />
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
                  <Input id="cat-seo" value={seo.categoryPages} onChange={(e) => set("categoryPages", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-seo">Tag pages</Label>
                  <Input id="tag-seo" value={seo.tagPages} onChange={(e) => set("tagPages", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-seo">Author pages</Label>
                  <Input id="auth-seo" value={seo.authorPages} onChange={(e) => set("authorPages", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-canonical">Canonical URL base</Label>
                <Input id="seo-canonical" value={seo.canonicalBase} onChange={(e) => set("canonicalBase", e.target.value)} />
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
                <Switch checked={seo.ogImageEnabled} onCheckedChange={(v) => set("ogImageEnabled", v)} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="og-title">Default OG title</Label>
                <Input id="og-title" value={seo.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og-desc">Default OG description</Label>
                <Textarea id="og-desc" rows={2} value={seo.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-handle">Twitter handle</Label>
                <Input id="twitter-handle" value={seo.twitterHandle} onChange={(e) => set("twitterHandle", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}><Save className="h-4 w-4" /> {lang === "bn" ? "সংরক্ষণ করুন" : "Save changes"}</Button>
      </div>
    </div>
  );
}
