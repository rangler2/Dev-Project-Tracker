import { safeInternalPath } from "@/lib/safe-redirect";
import { ConfirmEmailForm } from "./ConfirmEmailForm";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12">
      <div className="surface fade-in rounded-3xl p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Agency workspace
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-brand">
          Confirm your email
        </h1>
        <p className="mt-3 text-muted">
          Finish creating your Project Tracker account by confirming your work
          email below.
        </p>
        <div className="mt-8">
          <ConfirmEmailForm
            tokenHash={params.token_hash ?? null}
            type={params.type ?? null}
            next={safeInternalPath(params.next)}
          />
        </div>
      </div>
    </main>
  );
}
