export type AuthBanner = {
  tone: "success" | "warning";
  message: string;
};

/** Friendly copy for Supabase auth redirect / callback errors. */
export function authErrorBanner(params: {
  error?: string | null;
  error_code?: string | null;
  error_description?: string | null;
}): AuthBanner | null {
  const code = params.error_code?.toLowerCase() ?? "";
  const error = params.error?.toLowerCase() ?? "";
  const description = (params.error_description ?? "").replace(/\+/g, " ");

  if (
    code === "otp_expired" ||
    /invalid or has expired/i.test(description) ||
    (error === "access_denied" && /otp|expired|invalid/i.test(description))
  ) {
    return {
      tone: "success",
      message:
        "Your email is usually already confirmed when you see this. Work email security often opens the link first and burns it. Sign in with your password below.",
    };
  }

  if (error === "profile" || code === "profile") {
    return {
      tone: "warning",
      message:
        "Your account could not be linked to an organisation. Use a company email domain that has been allowed.",
    };
  }

  if (description) return { tone: "warning", message: description };
  if (params.error) return { tone: "warning", message: params.error };
  return null;
}

/** @deprecated use authErrorBanner */
export function authErrorMessage(params: {
  error?: string | null;
  error_code?: string | null;
  error_description?: string | null;
}): string | null {
  return authErrorBanner(params)?.message ?? null;
}
