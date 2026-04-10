import {
  isSafeExternalUrl,
  sanitizeExternalUrl,
  isSafePhoneNumber,
  isSafeEmail,
} from "../safe-url";

describe("isSafeExternalUrl", () => {
  it("accepts https URLs", () => {
    expect(isSafeExternalUrl("https://example.com")).toBe(true);
    expect(isSafeExternalUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(isSafeExternalUrl("http://example.com")).toBe(true);
  });

  it("rejects javascript: URLs", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("JavaScript:alert(1)")).toBe(false);
  });

  it("rejects data: URLs", () => {
    expect(isSafeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe(
      false
    );
  });

  it("rejects file: URLs", () => {
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
  });

  it("rejects ftp: URLs", () => {
    expect(isSafeExternalUrl("ftp://x")).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(isSafeExternalUrl("")).toBe(false);
    expect(isSafeExternalUrl("   ")).toBe(false);
  });

  it("rejects null and undefined", () => {
    expect(isSafeExternalUrl(null)).toBe(false);
    expect(isSafeExternalUrl(undefined)).toBe(false);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isSafeExternalUrl("//evil.com")).toBe(false);
  });

  it("rejects relative paths", () => {
    expect(isSafeExternalUrl("/foo")).toBe(false);
    expect(isSafeExternalUrl("foo/bar")).toBe(false);
  });
});

describe("sanitizeExternalUrl", () => {
  it("returns URL when safe", () => {
    expect(sanitizeExternalUrl("https://example.com")).toBe(
      "https://example.com"
    );
  });

  it("returns undefined for unsafe URLs", () => {
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeExternalUrl(null)).toBeUndefined();
    expect(sanitizeExternalUrl(undefined)).toBeUndefined();
    expect(sanitizeExternalUrl("")).toBeUndefined();
  });
});

describe("isSafePhoneNumber", () => {
  it("accepts international formats", () => {
    expect(isSafePhoneNumber("+34 600 123 456")).toBe(true);
    expect(isSafePhoneNumber("+1 (555) 123-4567")).toBe(true);
    expect(isSafePhoneNumber("12345")).toBe(true);
  });

  it("rejects javascript: injection attempts", () => {
    expect(isSafePhoneNumber("javascript:alert(1)")).toBe(false);
  });

  it("rejects empty and nullish", () => {
    expect(isSafePhoneNumber("")).toBe(false);
    expect(isSafePhoneNumber(null)).toBe(false);
    expect(isSafePhoneNumber(undefined)).toBe(false);
  });

  it("rejects strings with letters or special chars", () => {
    expect(isSafePhoneNumber("555-CALL-NOW")).toBe(false);
    expect(isSafePhoneNumber("<script>")).toBe(false);
  });

  it("rejects overly long input", () => {
    expect(isSafePhoneNumber("1".repeat(21))).toBe(false);
  });
});

describe("isSafeEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isSafeEmail("user@example.com")).toBe(true);
    expect(isSafeEmail("first.last+tag@sub.example.co")).toBe(true);
  });

  it("rejects javascript: injection attempts", () => {
    expect(isSafeEmail("javascript:alert(1)@x")).toBe(false);
  });

  it("rejects malformed emails", () => {
    expect(isSafeEmail("no-at-sign")).toBe(false);
    expect(isSafeEmail("missing@tld")).toBe(false);
    expect(isSafeEmail("has space@example.com")).toBe(false);
    expect(isSafeEmail("<script>@x.com")).toBe(false);
  });

  it("rejects nullish", () => {
    expect(isSafeEmail(null)).toBe(false);
    expect(isSafeEmail(undefined)).toBe(false);
    expect(isSafeEmail("")).toBe(false);
  });
});
