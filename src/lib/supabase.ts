import { createClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const rawUrl = env.VITE_SUPABASE_URL || "";
const rawKey = env.VITE_SUPABASE_ANON_KEY || "";

export const isPlaceholderConfig = 
  !rawUrl || 
  rawUrl.includes("placeholder-project") || 
  rawUrl.includes("your-project-id") ||
  !rawKey || 
  rawKey === "placeholder-key" ||
  rawKey === "your-anon-key" ||
  !rawUrl.startsWith("https://");

export const isSupabaseConfigured = !isPlaceholderConfig;
export const supabaseUrl = isSupabaseConfigured ? rawUrl : "https://placeholder-project.supabase.co";
export const supabaseAnonKey = isSupabaseConfigured ? rawKey : "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
});

