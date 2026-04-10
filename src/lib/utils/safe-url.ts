const SAFE_WEB_PROTOCOLS = new Set(["https:", "http:"]);

/**
 * Validates an external web URL (website links, social profiles, etc.).
 * Accepts only well-formed absolute http/https URLs.
 * Rejects javascript:, data:, file:, relative paths and malformed URLs.
 */
export function isSafeExternalUrl(url: string | undefined | null): boolean {
  if (typeof url !== "string" || url.trim().length === 0) return false;
  try {
    const parsed = new URL(url);
    return SAFE_WEB_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Returns the URL if safe (http/https), otherwise undefined.
 * Use for `href` on external anchors.
 */
export function sanitizeExternalUrl(url: string | undefined | null): string | undefined {
  return isSafeExternalUrl(url) ? (url as string) : undefined;
}

/**
 * Validates a phone number for use in `tel:` URLs.
 * Accepts digits, spaces, +, -, (), between 3 and 20 characters.
 * Prevents `javascript:` injection via click handlers.
 */
export function isSafePhoneNumber(phone: string | undefined | null): boolean {
  if (typeof phone !== "string") return false;
  return /^[+\d\s\-()]{3,20}$/.test(phone.trim());
}

/**
 * Basic email validation for use in `mailto:` URLs.
 * Intentionally strict about whitespace and angle brackets
 * to block javascript: or HTML injection payloads.
 */
export function isSafeEmail(email: string | undefined | null): boolean {
  if (typeof email !== "string") return false;
  const value = email.trim();
  if (!value || value.length > 254) return false;
  if (value.includes(" ") || value.includes("<") || value.includes(">")) return false;

  const atIndex = value.indexOf("@");
  if (atIndex <= 0 || atIndex !== value.lastIndexOf("@") || atIndex === value.length - 1) {
    return false;
  }

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (!local || !domain) return false;
  if (
    local.startsWith(".") ||
    local.endsWith(".") ||
    domain.startsWith(".") ||
    domain.endsWith(".")
  ) {
    return false;
  }
  if (!domain.includes(".")) return false;
  if (domain.includes("..")) return false;

  const labels = domain.split(".");
  if (labels.some((label) => label.length === 0)) return false;
  const tld = labels[labels.length - 1];
  if (!/^[a-zA-Z]{2,63}$/.test(tld)) return false;

  return true;
}
