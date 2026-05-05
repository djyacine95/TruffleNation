/** Prevent open redirects: only same-origin relative paths allowed. */

export function getSafeRedirectPath(
  raw: string | null | undefined,
  fallback: string = "/dashboard",
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://") || trimmed.includes("\\")) return fallback;
  return trimmed;
}
