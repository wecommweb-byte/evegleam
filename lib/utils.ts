/**
 * Converts a raw WooCommerce slug to a clean URL-safe slug.
 * WooCommerce returns URL-encoded slugs like "sage-a%c2%80%c2%93-long"
 * which must be decoded first before sanitizing.
 */
export function sanitizeSlug(raw: string): string {
  let s = raw || '';
  try { s = decodeURIComponent(s); } catch { /* already decoded */ }

  return s
    .replace(/[^\x20-\x7E]/g, '-') // replace ALL non-printable/non-ASCII with hyphen
    .replace(/[^a-zA-Z0-9-]/g, '-') // replace remaining special chars with hyphen
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim edges
    .toLowerCase();
}
