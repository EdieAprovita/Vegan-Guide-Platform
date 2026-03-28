import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns true only when the URL uses an allowed scheme (http/https).
 * Rejects javascript:, data:, vbscript:, and any other non-http(s) scheme
 * that could execute code when assigned to an href attribute.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
