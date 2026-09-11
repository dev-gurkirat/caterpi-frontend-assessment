"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/supabase/env";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createBrowserSupabaseClient(): SupabaseClient | null {
  const config = getPublicSupabaseConfig();

  if (!config) {
    return null;
  }

  return createBrowserClient(config.url, config.anonKey);
}
