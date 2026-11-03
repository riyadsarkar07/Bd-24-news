import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const QUERY_TIMEOUT_MS = 8000;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

function timedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);
  const parent = init?.signal;
  if (parent) {
    if (parent.aborted) controller.abort();
    else parent.addEventListener("abort", () => controller.abort(), { once: true });
  }
  const isBrowser = typeof window !== "undefined";
  return fetch(input, {
    ...init,
    ...(isBrowser ? { cache: "no-store" } : { next: { revalidate: 60 } }),
    signal: controller.signal,
  } as RequestInit).finally(() => {
    clearTimeout(timeout);
  });
}

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const isBrowser = typeof window !== "undefined";
  if (isBrowser) {
    if (!browserClient) {
      browserClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: { fetch: timedFetch },
      });
    }
    return browserClient;
  }
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: { fetch: timedFetch },
    });
  }
  return serverClient;
}

export function getSupabaseEndpoints(): { url: string; key: string } {
  return { url: supabaseUrl, key: supabaseKey };
}
