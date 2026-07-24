import { AppNav } from "@/components/AppNav";
import { requireUser } from "@/lib/auth";
import { getOrgName } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();
  const orgName = await getOrgName(profile.organization_id);

  return (
    <div className="min-h-screen">
      <AppNav profile={profile} orgName={orgName} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
