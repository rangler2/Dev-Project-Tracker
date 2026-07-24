import { redirect } from "next/navigation";
import { DEMO_MODE, demoProfile } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function requireUser() {
  if (DEMO_MODE) {
    return {
      supabase: null as unknown as Awaited<ReturnType<typeof createClient>>,
      user: { id: demoProfile.id, email: demoProfile.email },
      profile: demoProfile,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login?error=profile");
  }

  return { supabase, user, profile: profile as Profile };
}
