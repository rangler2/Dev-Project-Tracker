/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative URLs, scheme URLs, and userinfo tricks like `@evil.com`.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback = "/projects",
): string {
  if (!next) return fallback;

  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("@")) return fallback;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return fallback;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return fallback;

  return trimmed;
}
