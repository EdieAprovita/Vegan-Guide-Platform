/**
 * Shared utilities for building API query strings.
 *
 * Rules applied uniformly:
 *  - null / undefined values are skipped.
 *  - Empty strings are skipped.
 *  - Empty arrays are skipped.
 *  - Arrays produce one entry per element (multi-value param).
 *  - All other truthy scalars are coerced via String().
 *  - `mappings` lets callers rename a param key in the final URL
 *    (e.g. { minRating: "rating" } → appended as "rating").
 */
export function buildSearchParams(
  params: Record<string, unknown>,
  mappings: Record<string, string> = {}
): URLSearchParams {
  const sp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    const urlKey = mappings[key] ?? key;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          sp.append(urlKey, String(item));
        }
      });
      continue;
    }

    if (typeof value === "string" && value === "") continue;

    // Numeric 0 is falsy but valid — skip only undefined/null (handled above).
    sp.append(urlKey, String(value));
  }

  return sp;
}
