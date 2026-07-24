import Link from "next/link";
import { signOut } from "@/app/(app)/actions";
import type { Profile } from "@/types/database";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/clients", label: "Clients" },
  { href: "/leaderboard", label: "Pulse board" },
];

export function AppNav({
  profile,
  orgName,
}: {
  profile: Profile;
  orgName: string;
}) {
  return (
    <header className="border-b border-line/80 bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/projects" className="group">
            <p className="font-[family-name:var(--font-display)] text-xl tracking-tight text-brand">
              Project Tracker
            </p>
            <p className="text-xs text-muted transition group-hover:text-ink">
              {orgName}
            </p>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/60 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">{profile.display_name}</p>
            <p className="text-xs text-muted">{profile.email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="btn btn-secondary text-sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex gap-1 overflow-x-auto px-4 pb-3 sm:hidden sm:px-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/60 hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
