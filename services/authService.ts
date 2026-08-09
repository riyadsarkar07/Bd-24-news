import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";

export const ADMIN_ACCOUNTS: Array<{ email: string; uid: string }> = [
  { email: "bd24news@tensi.org", uid: "8HTfUJOKIgZxbd9PuQAjr1HhuUa" },
  { email: "riyadsarkar1243@gmail.com", uid: "45StAH7WmbPt1l0tfJplfu2GSa33" },
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
  const db = getFirebaseDb();
  if (!db || typeof window === "undefined") return false;
  try {
    const snap = await getDocs(query(collection(db, "users"), where("email", "==", normalized)));
    return snap.docs.some((d) => d.data().status !== "banned");
  } catch (err) {
    console.error("Failed to check registered user:", err);
    return false;
  }
}

export async function signInAdmin(email: string, password: string): Promise<User> {
  if (typeof window === "undefined") throw new Error("Authentication is only available in the browser.");
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* environment variables.");
  const normalized = email.trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(auth, normalized, password);
  if (!isAdminUid(credential.user.uid)) {
    await fbSignOut(auth);
    throw new Error("This account does not have access to the admin panel.");
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
  const allowed = await isRegisteredUser(normalized);
  if (!allowed) {
    throw new Error("This email is not registered on the admin panel.");
  }
  await sendPasswordResetEmail(auth, normalized);
}
