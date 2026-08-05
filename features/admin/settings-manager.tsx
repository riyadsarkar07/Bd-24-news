"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Save, Building2, Languages, Bell, Palette, Globe2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/providers/language-provider";

export function SettingsManager() {
  const { lang } = useLanguage();
  const [darkMode, setDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [breakingAlerts, setBreakingAlerts] = React.useState(true);
  const [emailOnComment, setEmailOnComment] = React.useState(false);

  const save = () => toast.success(lang === "bn" ? "সেটিংস সংরক্ষিত হয়েছে" : "Settings saved");

  return (
    <div className="space-y-6">
      <PageHeader
        title={lang === "bn" ? "সেটিংস" : "Settings"}
        description="Site configuration"
        action={<Button onClick={save}><Save className="h-4 w-4" /> {lang === "bn" ? "সংরক্ষণ করুন" : "Save changes"}</Button>}
      />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general"><Building2 className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="language"><Languages className="h-4 w-4" /> Language</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{<CardTitle>{lang === "bn" ? "সাইট তথ্য" : "Site Information"}</CardTitle>}</CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="set-name">Site name</Label>
                  <Input id="set-name" defaultValue="BD24News" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-tagline">Tagline</Label>
                  <Input id="set-tagline" defaultValue="Bangladesh's Leading News Portal" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-desc">Description</Label>
                <Textarea id="set-desc" rows={2} defaultValue="Latest Bangladeshi news, sports, economy, technology and more, updated 24/7." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-url">Site URL</Label>
                <Input id="set-url" defaultValue="https://bd24news.vercel.app" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="set-timezone">Timezone</Label>
                  <Select defaultValue="asia/dhaka">
                    <SelectTrigger id="set-timezone"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia/dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                      <SelectItem value="asia/kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-locale">Locale</Label>
                  <Select defaultValue="bn">
                    <SelectTrigger id="set-locale"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>{<CardTitle>{lang === "bn" ? "সামাজিক লিংক" : "Social Links"}</CardTitle>}</CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {["Facebook", "Twitter / X", "YouTube", "Instagram", "TikTok", "Telegram"].map((s) => (
                <div key={s} className="space-y-2">
                  <Label htmlFor={`social-${s}`}>{s}</Label>
                  <Input id={`social-${s}`} placeholder={`https://${s.toLowerCase().replace(/[^a-z]/g, "")}.com/bd24news`} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{<CardTitle>{lang === "bn" ? "দৃশ্যমানতা" : "Appearance"}</CardTitle>}</CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Default dark mode</p>
                  <p className="text-xs text-muted-foreground">Use dark theme for first-time visitors</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="set-accent">Accent color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue="#E50914" className="h-10 w-12 cursor-pointer rounded-lg border bg-transparent" />
                  <code className="text-xs text-muted-foreground">#E50914 (brand red)</code>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-font">Primary font</Label>
                <Select defaultValue="hind">
                  <SelectTrigger id="set-font"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hind">Hind Siliguri</SelectItem>
                    <SelectItem value="noto">Noto Sans Bengali</SelectItem>
                    <SelectItem value="solaiman">SolaimanLipi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{<CardTitle>{lang === "bn" ? "ভাষা" : "Language"}</CardTitle>}</CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Enable English UI</p>
                  <p className="text-xs text-muted-foreground">Allow visitors to switch to English</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="set-default-lang">Default language</Label>
                <Select defaultValue="bn">
                  <SelectTrigger id="set-default-lang"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bn">বাংলা</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{<CardTitle>{lang === "bn" ? "নোটিফিকেশন" : "Notifications"}</CardTitle>}</CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Send breaking news via browser push</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Breaking news alerts</p>
                  <p className="text-xs text-muted-foreground">Instant alerts for breaking stories</p>
                </div>
                <Switch checked={breakingAlerts} onCheckedChange={setBreakingAlerts} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Email on new comment</p>
                  <p className="text-xs text-muted-foreground">Notify moderators of new comments</p>
                </div>
                <Switch checked={emailOnComment} onCheckedChange={setEmailOnComment} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-6">
          <Card>
            <CardHeader>{<CardTitle>{lang === "bn" ? "নিরাপত্তা" : "Security"}</CardTitle>}</CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Force HTTPS</p>
                  <p className="text-xs text-muted-foreground">Redirect all traffic to HTTPS</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="set-csp">Content Security Policy</Label>
                <Textarea id="set-csp" rows={3} defaultValue="default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline';" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
