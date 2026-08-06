import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "bd24news@tensi.org,riyadsarkar1243@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAIL = ADMIN_EMAILS[0] ?? "bd24news@tensi.org";

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export async function signInAdmin(email: string, password: string): Promise<User> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* environment variables.");
  const normalized = email.trim().toLowerCase();
  if (!isAdminEmail(normalized)) {
    throw new Error("Only the administrator account is allowed to sign in.");
  }
  const credential = await signInWithEmailAndPassword(auth, normalized, password);
  if (!isAdminEmail(credential.user.email ?? "")) {
    await fbSignOut(auth);
    throw new Error("Only the administrator account is allowed to sign in.");
  }
  return credential.user;
}

export async function signOutAdmin(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await fbSignOut(auth);
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth?.currentUser ?? null;
}

export async function resetAdminPassword(email: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");
  const normalized = email.trim().toLowerCase();
  if (!isAdminEmail(normalized)) {
    throw new Error("Only the administrator account is allowed to reset the password.");
  }
  await sendPasswordResetEmail(auth, normalized);
}
