import { getSupabase } from "@/lib/supabase/client";

const VISITOR_KEY = "bd24news.visitor_id";

/**
 * Stable, anonymous per-browser identifier used only to avoid counting the
 * same reader more than once per article per day. It contains no personal
 * information and never leaves this site's Supabase project.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length >= 8) return existing;
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(VISITOR_KEY, generated);
    return generated;
  } catch {
    return "";
  }
}

function isMissingFunction(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("could not find the function") || m.includes("schema cache") || m.includes("does not exist");
}

export interface ViewCountResult {
  views: number | null;
  /** True when the counting RPC is not deployed yet. */
  unavailable: boolean;
}

/** Records a single view (deduplicated server-side) and returns the new total. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function recordArticleView(articleId: string): Promise<ViewCountResult> {
  const supabase = getSupabase();
  const visitorId = getVisitorId();
  if (!supabase || !UUID_RE.test(articleId) || !visitorId) return { views: null, unavailable: false };
  try {
    const { data, error } = await supabase.rpc("increment_article_views", {
      p_article_id: articleId,
      p_visitor_id: visitorId,
    });
    if (error) {
      if (isMissingFunction(error.message)) return { views: null, unavailable: true };
      console.error("View counting failed:", error.message);
      return { views: null, unavailable: false };
    }
    return { views: typeof data === "number" ? data : Number(data) || null, unavailable: false };
  } catch (err) {
    console.error("View counting failed:", err);
    return { views: null, unavailable: false };
  }
}

/** Admin: set an article's view count to an exact value. */
export async function setArticleViews(articleId: string, views: number): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!UUID_RE.test(articleId)) throw new Error("This article has no database id, so views cannot be edited.");
  const { data, error } = await supabase.rpc("admin_set_article_views", {
    p_article_id: articleId,
    p_views: Math.max(0, Math.floor(views)),
  });
  if (error) throw new Error(error.message);
  return Number(data) || 0;
}

/** Admin: add or remove views (result is clamped at zero). */
export async function adjustArticleViews(articleId: string, delta: number): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!UUID_RE.test(articleId)) throw new Error("This article has no database id, so views cannot be edited.");
  const { data, error } = await supabase.rpc("admin_adjust_article_views", {
    p_article_id: articleId,
    p_delta: Math.trunc(delta),
  });
  if (error) throw new Error(error.message);
  return Number(data) || 0;
}
