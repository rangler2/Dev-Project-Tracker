"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Supabase sometimes returns auth failures in the URL hash.
 * Normalize them into query params so the server-rendered login banner can show them.
 */
export function AuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;

    const hash = new URLSearchParams(raw);
    if (!hash.get("error") && !hash.get("error_code")) return;

    const next = new URLSearchParams(window.location.search);
    for (const key of ["error", "error_code", "error_description"] as const) {
      const value = hash.get(key);
      if (value && !next.has(key)) next.set(key, value);
    }

    router.replace(`/login?${next.toString()}`, { scroll: false });
  }, [router]);

  return null;
}
