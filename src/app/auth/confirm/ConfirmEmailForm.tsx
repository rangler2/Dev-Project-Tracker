"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type ConfirmEmailFormProps = {
  tokenHash: string | null;
  type: string | null;
  next: string;
};

export function ConfirmEmailForm({
  tokenHash,
  type,
  next,
}: ConfirmEmailFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = useMemo(
    () => Boolean(tokenHash && type),
    [tokenHash, type],
  );

  async function onConfirm(event: FormEvent) {
    event.preventDefault();
    if (!canConfirm || loading || !tokenHash || !type) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });

      if (verifyError) throw verifyError;

      router.replace(next);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not confirm your email";
      const alreadyUsed =
        /expired|invalid|otp/i.test(message) ||
        (err as { code?: string } | null)?.code === "otp_expired";

      setError(
        alreadyUsed
          ? "This confirmation link was already used or has expired. If your email is confirmed, you can sign in."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  if (!canConfirm) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--line))] bg-white px-3 py-2 text-sm text-danger">
          This confirmation link is missing required details. Request a new
          signup email, or sign in if your account is already confirmed.
        </p>
        <a href="/login" className="btn btn-primary inline-flex w-full justify-center">
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onConfirm} className="space-y-4">
      <p className="text-sm text-muted">
        Email security tools sometimes open confirmation links automatically.
        Confirming here with a button avoids that consuming the one-time link.
      </p>

      {error ? (
        <p className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--line))] bg-white px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Confirming…" : "Confirm email address"}
      </button>

      <p className="text-center text-sm text-muted">
        Already confirmed?{" "}
        <a href="/login" className="font-semibold text-brand underline-offset-2 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
