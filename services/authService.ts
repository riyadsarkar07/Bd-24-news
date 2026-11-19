import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

export const ADMIN_ACCOUNTS: Array<{ email: string; uid: string }> = [
  { email: "bd24news@tensi.org", uid: "304673b9-c910-4e3f-864c-155f3d743e64" },
  { email: "riyadsarkar1243@gmail.com", uid: "905e2a90-3e47-40ca-ad98-57d7d1fbd319" },
];

const sectionPermissions: Record<string, string[]> = {
  "/admin/news": ["news:write", "news:publish", "news:delete"],
  "/admin/media": ["media:upload", "media:manage"],
  "/admin/comments": ["comments:moderate"],
};

export async function newsroomRoutes(): Promise<string[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data: assurance, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") return ["/2fa"];
  const permissions = await client.rpc("newsroom_capabilities");
  if (permissions.error) throw permissions.error;
  const grants: string[] = permissions.data;
  if (grants.includes("*")) return ["/admin"];
  return Object.keys(sectionPermissions).filter((section) =>
    sectionPermissions[section]?.some((permission) => grants.includes(permission)));
}

export async function newsroomDestination() {
  return (await newsroomRoutes())[0] ?? "/admin/login";
}

export async function signInAdmin(email: string, password: string): Promise<string> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.");
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalized, password });
  if (error) throw new Error(error.message);
  const destination = await newsroomDestination();
  if (!data.user || destination === "/admin/login") {
    await supabase.auth.signOut();
    throw new Error("This account does not have access to the admin panel.");
  }
  return destination;
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
  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: window.location.origin + "/reset-password",
  });
  if (error) throw new Error(error.message);
}

export async function updateAdminProfile(patch: {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}): Promise<void> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("You are not signed in.");

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      ...(user.user_metadata ?? {}),
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
      ...(patch.avatar !== undefined ? { avatar: patch.avatar } : {}),
    },
  });
  if (authError) throw new Error(authError.message);

  const profilePatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) profilePatch.name = patch.name;
  if (patch.avatar !== undefined) profilePatch.avatar = patch.avatar;
  const { error: profileError } = await supabase
    .from("profiles")
    .update(profilePatch)
    .eq("id", user.id);
  if (profileError) throw new Error(profileError.message);
}

export async function updateAdminPassword(password: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

