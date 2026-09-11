"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/domain/routes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const client = createBrowserSupabaseClient();
    await client?.auth.signOut();
    router.push(ROUTES.login);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-muted hover:text-navy sm:px-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
    >
      Sign out
    </button>
  );
}
