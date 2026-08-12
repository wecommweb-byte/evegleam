// Single source of truth for the store's WhatsApp number.
//
// Format: digits only, including country code, with no "+", spaces or dashes.
// Example for a Pakistani number 0300 1234567  ->  '923001234567'
//
// Left empty on purpose: every WhatsApp button checks this and hides itself when it is
// blank, so an unconfigured store never links customers to somebody else's number.
export const WHATSAPP_NUMBER = '';

/** Builds a wa.me deep link with a pre-filled message, or '' if no number is configured. */
export function whatsappLink(message: string): string {
  if (!WHATSAPP_NUMBER) return '';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
