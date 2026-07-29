import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeInternalPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeInternalPath(searchParams.get("next"));
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  // Supabase sometimes sends failures to the redirect URL with query params.
  if (errorCode || searchParams.get("error")) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", searchParams.get("error") ?? "access_denied");
    if (errorCode) login.searchParams.set("error_code", errorCode);
    if (errorDescription) {
      login.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(login);
  }

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const login = new URL("/login", origin);
  login.searchParams.set("error", "access_denied");
  login.searchParams.set("error_code", "otp_expired");
  login.searchParams.set(
    "error_description",
    "Email link is invalid or has expired",
  );
  return NextResponse.redirect(login);
}
