// Shared request-validation helpers.

// True for absolute http(s) URLs such as "https://example.com/page".
export const isHttpUrl = (value: unknown): boolean => {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Must match the field dropdown in the admin provider form and the filter
// chips on the public Providers page.
export const PROVIDER_FIELDS = [
  "Reproductive Health",
  "Counseling & Psychology",
  "General Medicine",
];
