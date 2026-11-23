import { createClient } from "@supabase/supabase-js";
import config from "../../../supabase.config.json";

const configured = (v?: string) => (v && !v.includes("YOUR-") ? v : undefined);
const url = configured(import.meta.env.VITE_SUPABASE_URL) ?? configured(config.url);
const anonKey = configured(import.meta.env.VITE_SUPABASE_ANON_KEY) ?? configured(config.anonKey);

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase is not configured: fill in supabase.config.json (or the VITE_SUPABASE_* env vars).");
}

export const supabase = createClient(url ?? "http://localhost:54321", anonKey ?? "public-anon-key", {
  auth: { persistSession: true, autoRefreshToken: true },
});
