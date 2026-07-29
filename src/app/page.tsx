import { redirect } from "next/navigation";
import { DEMO_MODE } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (DEMO_MODE) {
    redirect("/projects");
  }

  const params = await searchParams;
  const hasAuthError =
    typeof params.error === "string" ||
    typeof params.error_code === "string" ||
    typeof params.error_description === "string";

  // Auth email failures often land on Site URL (/). Send them to login with context.
  if (hasAuthError) {
    const login = new URLSearchParams();
    for (const key of ["error", "error_code", "error_description"] as const) {
      const value = params[key];
      if (typeof value === "string") login.set(key, value);
    }
    redirect(`/login?${login.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/projects" : "/login");
}
