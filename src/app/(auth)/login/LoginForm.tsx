"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { isDomainError } from "@/lib/domain";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "confirm";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    if (next !== "confirm") setOtp("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/projects");
        router.refresh();
        return;
      }

      if (mode === "confirm") {
        const token = otp.replace(/\s+/g, "");
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });
        if (verifyError) throw verifyError;

        router.push("/projects");
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || undefined },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.push("/projects");
        router.refresh();
        return;
      }

      setMode("confirm");
      setInfo(
        "If your email shows a 6-digit code, enter it here. If it only has a link (or the link says expired), skip the link and sign in — work email security often confirms the account automatically.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      if (isDomainError(message)) {
        setError(
          "That email domain is not allowed. Use your organisation work email.",
        );
      } else if (/expired|invalid|otp/i.test(message)) {
        setError(
          "That code is invalid or was already used. If your account is confirmed, sign in with your password.",
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" ? (
        <div>
          <label className="label" htmlFor="display_name">
            Display name
          </label>
          <input
            id="display_name"
            className="field"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Alex Developer"
            autoComplete="name"
          />
        </div>
      ) : null}

      <div>
        <label className="label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          type="email"
          required
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@greatstate.co"
          autoComplete="email"
          readOnly={mode === "confirm"}
        />
      </div>

      {mode === "confirm" ? (
        <div>
          <label className="label" htmlFor="otp">
            6-digit confirmation code
          </label>
          <input
            id="otp"
            inputMode="numeric"
            pattern="[0-9 ]{6,8}"
            required
            minLength={6}
            maxLength={8}
            className="field tracking-[0.3em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            autoComplete="one-time-code"
            autoFocus
          />
        </div>
      ) : (
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--line))] bg-white px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-muted">
          {info}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading
          ? "Please wait…"
          : mode === "signin"
            ? "Sign in"
            : mode === "confirm"
              ? "Confirm email"
              : "Create account"}
      </button>

      {mode === "confirm" ? (
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => switchMode("signin")}
        >
          Link expired / already confirmed — sign in
        </button>
      ) : null}

      <p className="text-center text-sm text-muted">
        {mode === "confirm" ? (
          <>
            Wrong email?{" "}
            <button
              type="button"
              className="font-semibold text-brand underline-offset-2 hover:underline"
              onClick={() => switchMode("signup")}
            >
              Start over
            </button>
          </>
        ) : (
          <>
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-semibold text-brand underline-offset-2 hover:underline"
              onClick={() =>
                switchMode(mode === "signin" ? "signup" : "signin")
              }
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </>
        )}
      </p>
    </form>
  );
}
