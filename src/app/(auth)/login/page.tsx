import { authErrorBanner } from "@/lib/auth-errors";
import { AuthHashRedirect } from "./AuthHashRedirect";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    error_code?: string;
    error_description?: string;
  }>;
}) {
  const params = await searchParams;
  const banner = authErrorBanner(params);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12">
      <div className="surface fade-in rounded-3xl p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Agency workspace
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-brand">
          Project Tracker
        </h1>
        <p className="mt-3 text-muted">
          Sign in with your work email. Access is limited to approved organisation
          domains.
        </p>
        {banner ? (
          <p
            className={
              banner.tone === "success"
                ? "mt-4 rounded-lg border border-[color-mix(in_srgb,var(--success)_35%,var(--line))] bg-white px-3 py-2 text-sm text-success"
                : "mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent"
            }
          >
            {banner.message}
          </p>
        ) : null}
        <AuthHashRedirect />
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
