import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

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
        {params.error === "profile" ? (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
            Your account could not be linked to an organisation. Use a company
            email domain that has been allowed.
          </p>
        ) : null}
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
