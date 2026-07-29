/** Friendly copy for Supabase auth redirect / callback errors. */
export function authErrorMessage(params: {
  error?: string | null;
  error_code?: string | null;
  error_description?: string | null;
}): string | null {
  const code = params.error_code?.toLowerCase() ?? "";
  const error = params.error?.toLowerCase() ?? "";
  const description = (params.error_description ?? "").replace(/\+/g, " ");

  if (
    code === "otp_expired" ||
    /invalid or has expired/i.test(description) ||
    (error === "access_denied" && /otp|expired|invalid/i.test(description))
  ) {
    return "This confirmation link was already used or has expired. Corporate email security often opens links before you do — if your email is confirmed, just sign in.";
  }

  if (error === "profile" || code === "profile") {
    return "Your account could not be linked to an organisation. Use a company email domain that has been allowed.";
  }

  if (description) return description;
  if (params.error) return params.error;
  return null;
}
