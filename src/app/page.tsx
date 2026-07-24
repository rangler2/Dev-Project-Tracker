import { redirect } from "next/navigation";
import { DEMO_MODE } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (DEMO_MODE) {
    redirect("/projects");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/projects" : "/login");
}
