/**
 * Converts a raw WooCommerce slug to a clean, URL-safe slug.
 * Handles mojibake em-dashes (e.g. â€" leftover bytes showing as garbage).
 */
export function sanitizeSlug(raw: string): string {
  return (raw || '')
    // Replace unicode dashes with a hyphen
    .replace(/[–—‒‐]/g, '-')
    // Remove all non-printable and non-ASCII characters (includes control chars like -)
    .replace(/[^\x20-\x7E]/g, '')
    // Replace anything that's not a letter, digit, or hyphen with a hyphen
    .replace(/[^a-zA-Z0-9-]/g, '-')
    // Collapse multiple consecutive hyphens into one
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Fixes common UTF-8 mojibake sequences that appear when text was stored
 * with incorrect encoding in WooCommerce (e.g. â€" instead of –).
 */
export function decodeMojibake(text: string): string {
  if (!text) return text;
  return text
    .replace(/â€"/g, '–')     // en-dash
    .replace(/â€"/g, '—')     // em-dash
    .replace(/â€™/g, '’') // right single quote '
    .replace(/â€˜/g, '‘') // left single quote '
    .replace(/â€œ/g, '“') // left double quote "
    .replace(/â€/g, '”')  // right double quote "
    .replace(/â€¦/g, '…')     // ellipsis
    .replace(/Â·/g, '·')       // middle dot
    .replace(/Ã©/g, 'é')
    .replace(/Ã /g, 'à')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã®/g, 'î')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã»/g, 'û')
    // Remove any remaining stray non-printable control chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}
