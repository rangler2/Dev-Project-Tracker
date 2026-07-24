export function isDomainError(message: string | undefined) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("email domain") ||
    lower.includes("not allowed") ||
    lower.includes("organisation") ||
    lower.includes("organization")
  );
}
