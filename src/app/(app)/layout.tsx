import { AppNav } from "@/components/AppNav";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, profile } = await requireUser();
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .single();

  return (
    <div className="min-h-screen">
      <AppNav profile={profile} orgName={org?.name ?? "Organisation"} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
