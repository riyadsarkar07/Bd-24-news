"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Save, Camera, KeyRound, UserRound, Mail, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language-provider";

export function ProfileManager() {
  const { lang } = useLanguage();
  const [twoFactor, setTwoFactor] = React.useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title={lang === "bn" ? "প্রোফাইল" : "Profile"} description={lang === "bn" ? "আপনার অ্যাকাউন্ট ও সেটিংস" : "Manage your account settings"} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-brand/20">
                <AvatarFallback className="bg-gradient-to-br from-brand to-accentblue text-3xl text-white">এড</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 rounded-full bg-brand p-2 text-white shadow-glow" onClick={() => toast.success(lang === "bn" ? "ছবি পরিবর্তন করা হয়েছে" : "Photo updated")} aria-label="Change avatar">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-lg font-black">সিটিং অ্যাডমিন</p>
              <p className="text-sm text-muted-foreground">Administrator • admin@bd24news.com</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-brand/15 text-brand">Admin</Badge>
              <Badge variant="outline" className="text-success">Verified</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-brand" /> {lang === "bn" ? "ব্যক্তিগত তথ্য" : "Personal Information"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-name">Full name</Label>
                <Input id="pf-name" defaultValue="সিটিং অ্যাডমিন" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-email">Email</Label>
                <Input id="pf-email" type="email" defaultValue="admin@bd24news.com" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-phone">Phone</Label>
                <Input id="pf-phone" defaultValue="+880 1712-345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-role">Role</Label>
                <Input id="pf-role" defaultValue="Administrator" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-bio">Bio</Label>
              <Textarea id="pf-bio" rows={3} defaultValue="Managing BD24News news portal operations." />
            </div>
            <Button onClick={() => toast.success(lang === "bn" ? "প্রোফাইল সংরক্ষিত হয়েছে" : "Profile saved")}><Save className="h-4 w-4" /> {lang === "bn" ? "সংরক্ষণ করুন" : "Save"}</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-brand" /> {lang === "bn" ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw-current">Current password</Label>
              <Input id="pw-current" type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pw-new">New password</Label>
                <Input id="pw-new" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-confirm">Confirm new password</Label>
                <Input id="pw-confirm" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button variant="outline" onClick={() => toast.success(lang === "bn" ? "পাসওয়ার্ড পরিবর্তন হয়েছে" : "Password changed")}>Update password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand" /> {lang === "bn" ? "নিরাপত্তা" : "Security"}</CardTitle>
            <CardDescription>{lang === "bn" ? "অ্যাকাউন্ট সুরক্ষা" : "Account protection"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">{lang === "bn" ? "লগইনের সময় OTP যাচাই" : "Require OTP verification at login"}</p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Session timeout</p>
                <p className="text-xs text-muted-foreground">{lang === "bn" ? "অ্যাকাউন্ট স্বয়ংক্রিয় লগআউট" : "Auto logout after inactivity"}</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{lang === "bn" ? "লগইন ডিভাইস" : "Active sessions"}</p>
                <p className="text-xs text-muted-foreground">2 sessions active</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success(lang === "bn" ? "সব সেশন থেকে লগআউট হয়েছে" : "Signed out of all sessions")}>
                {lang === "bn" ? "সব লগআউট" : "Sign out all"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
