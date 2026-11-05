"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Save, Camera, KeyRound, UserRound, Mail, ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { PageHeader } from "@/features/admin/admin-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language-provider";
import {
  onAuthStateChange,
  resetAdminPassword,
  signOutAdmin,
  updateAdminPassword,
  updateAdminProfile,
} from "@/services/authService";
import { uploadMediaFile } from "@/services/mediaService";

export function ProfileManager() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [user, setUser] = React.useState<{ name: string; email: string; avatar: string } | null>(null);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [initialProfile, setInitialProfile] = React.useState({ name: "", phone: "", bio: "", avatar: "" });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [sendingReset, setSendingReset] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return onAuthStateChange((u) => {
      const email = u?.email ?? "";
      const meta = (u?.user_metadata ?? {}) as { name?: string; phone?: string; bio?: string; avatar?: string };
      const displayName = meta.name || email.split("@")[0] || "Administrator";
      setUser({ name: displayName, email, avatar: meta.avatar ?? "" });
      setName(displayName);
      setPhone(meta.phone ?? "");
      setBio(meta.bio ?? "");
      setAvatar(meta.avatar ?? "");
      setInitialProfile({
        name: displayName,
        phone: meta.phone ?? "",
        bio: meta.bio ?? "",
        avatar: meta.avatar ?? "",
      });
    });
  }, []);

  const initial = user?.name?.charAt(0) || "A";
  const dirty =
    name !== initialProfile.name ||
    phone !== initialProfile.phone ||
    bio !== initialProfile.bio ||
    avatar !== initialProfile.avatar;

  async function save() {
    if (!name.trim()) {
      toast.error(lang === "bn" ? "নাম আবশ্যক" : "Name is required");
      return;
    }
    try {
      setSaving(true);
      await updateAdminProfile({ name: name.trim(), phone, bio, avatar });
      setUser((u) => (u ? { ...u, name: name.trim(), avatar } : u));
      setInitialProfile({ name: name.trim(), phone, bio, avatar });
      toast.success(lang === "bn" ? "প্রোফাইল সংরক্ষিত হয়েছে" : "Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatar(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(lang === "bn" ? "শুধু ছবি আপলোড করুন" : "Please choose an image file");
      return;
    }
    try {
      setUploading(true);
      const item = await uploadMediaFile(file);
      setAvatar(item.src);
      await updateAdminProfile({ avatar: item.src });
      setUser((u) => (u ? { ...u, avatar: item.src } : u));
      setInitialProfile((p) => ({ ...p, avatar: item.src }));
      toast.success(lang === "bn" ? "ছবি পরিবর্তন করা হয়েছে" : "Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload photo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function changePassword() {
    if (newPassword.length < 6) {
      toast.error(lang === "bn" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর" : "Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(lang === "bn" ? "পাসওয়ার্ড মেলেনি" : "Passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      await updateAdminPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      toast.success(lang === "bn" ? "পাসওয়ার্ড পরিবর্তিত হয়েছে" : "Password updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setChangingPassword(false);
    }
  }

  async function sendReset() {
    if (!user?.email) return;
    try {
      setSendingReset(true);
      await resetAdminPassword(user.email);
      toast.success(lang === "bn" ? "রিসেট ইমেইল পাঠানো হয়েছে" : "Reset email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setSendingReset(false);
    }
  }

  async function signOutAll() {
    try {
      await signOutAdmin();
      toast.success(lang === "bn" ? "লগআউট হয়েছে" : "Signed out");
      router.push("/admin/login");
    } catch {
      toast.error(lang === "bn" ? "লগআউট ব্যর্থ হয়েছে" : "Sign out failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={lang === "bn" ? "প্রোফাইল" : "Profile"} description={lang === "bn" ? "আপনার অ্যাকাউন্ট ও সেটিংস" : "Manage your account settings"} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-brand/20">
                {avatar && <AvatarImage src={avatar} alt={name || "Administrator"} />}
                <AvatarFallback className="bg-gradient-to-br from-brand to-accentblue text-3xl text-white">{initial}</AvatarFallback>
              </Avatar>
              <button
                className="absolute -bottom-1 -right-1 rounded-full bg-brand p-2 text-white shadow-glow disabled:opacity-60"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change avatar"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleAvatar(e.target.files)} />
            </div>
            <div>
              <p className="text-lg font-black">{name || "Administrator"}</p>
              <p className="text-sm text-muted-foreground">Administrator • {user?.email || "—"}</p>
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
                <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-email">Email</Label>
                <Input id="pf-email" type="email" value={user?.email ?? ""} disabled />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-phone">Phone</Label>
                <Input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 …" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-role">Role</Label>
                <Input id="pf-role" defaultValue="Administrator" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-bio">Bio</Label>
              <Textarea id="pf-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={lang === "bn" ? "সংক্ষিপ্ত পরিচিতি" : "A short bio"} />
            </div>
            <Button onClick={save} disabled={saving || !dirty}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {lang === "bn" ? "সংরক্ষণ করুন" : "Save"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-brand" /> {lang === "bn" ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}</CardTitle>
            <CardDescription className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {lang === "bn" ? "সরাসরি পরিবর্তন করুন অথবা ইমেইলে রিসেট লিংক নিন।" : "Change it here, or send a reset link to your verified email."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pw-new">New password</Label>
                <Input id="pw-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-confirm">Confirm new password</Label>
                <Input id="pw-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={changePassword} disabled={changingPassword || !newPassword}>
                {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </Button>
              <Button variant="ghost" onClick={sendReset} disabled={sendingReset || !user?.email}>
                {sendingReset && <Loader2 className="h-4 w-4 animate-spin" />}
                Email reset link
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand" /> {lang === "bn" ? "নিরাপত্তা" : "Security"}</CardTitle>
            <CardDescription>{lang === "bn" ? "অ্যাকাউন্ট সুরক্ষা" : "Account protection"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-3 text-sm">
              <p className="font-semibold">{lang === "bn" ? "দুই-ধাপ যাচাই" : "Two-factor authentication"}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "Supabase Auth-এ এখনো কনফিগার করা হয়নি।"
                  : "Not configured yet in Supabase Auth."}
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{lang === "bn" ? "সেশন" : "Active sessions"}</p>
                <p className="text-xs text-muted-foreground">{lang === "bn" ? "সব ডিভাইস থেকে লগআউট করুন" : "Sign out everywhere"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={signOutAll}>
                <LogOut className="h-4 w-4" />
                {lang === "bn" ? "সব লগআউট" : "Sign out all"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
