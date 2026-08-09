import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

export const ADMIN_ACCOUNTS: Array<{ email: string; uid: string }> = [
  { email: "bd24news@tensi.org", uid: "304673b9-c910-4e3f-864c-155f3d743e64" },
  { email: "riyadsarkar1243@gmail.com", uid: "905e2a90-3e47-40ca-ad98-57d7d1fbd319" },
];

export const ADMIN_EMAILS = ADMIN_ACCOUNTS.map((a) => a.email);

export const ADMIN_UIDS = ADMIN_ACCOUNTS.map((a) => a.uid);

export const ADMIN_EMAIL = ADMIN_EMAILS[0] ?? "bd24news@tensi.org";

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function isAdminUid(uid: string): boolean {
  return ADMIN_UIDS.includes(uid);
}

export async function isRegisteredUser(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (isAdminEmail(normalized)) return true;
  const supabase = getSupabase();
  if (!supabase || typeof window === "undefined") return false;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id,status")
      .eq("email", normalized)
      .limit(1)
      .maybeSingle();
    return Boolean(data && data.status !== "banned");
  } catch (err) {
    console.error("Failed to check registered user:", err);
    return false;
  }
}

export async function signInAdmin(email: string, password: string): Promise<User> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.");
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalized, password });
  if (error) throw new Error(error.message);
  if (!data.user || !isAdminUid(data.user.id)) {
    await supabase.auth.signOut();
    throw new Error("This account does not have access to the admin panel.");
  }
  return data.user as User;
}

export async function signOutAdmin(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
}

let currentUser: User | null = null;

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) {
    callback(null);
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = (session?.user as User) ?? null;
    callback(currentUser);
  });
  return () => data.subscription.unsubscribe();
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export async function resetAdminPassword(email: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const normalized = email.trim().toLowerCase();
  const allowed = await isRegisteredUser(normalized);
  if (!allowed) {
    throw new Error("This email is not registered on the admin panel.");
  }
  const { error } = await supabase.auth.resetPasswordForEmail(normalized);
  if (error) throw new Error(error.message);
}
