/**
 * Application Constants & Configuration
 * Loaded dynamically from environment variables without hardcoded fallbacks
 */

export const WHATSAPP_RAW_NUMBER =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '250791515013').replace(/[^0-9]/g, '');

export const WHATSAPP_DISPLAY_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY_NUMBER ||
  (WHATSAPP_RAW_NUMBER.length >= 12
    ? `+${WHATSAPP_RAW_NUMBER.slice(0, 3)} ${WHATSAPP_RAW_NUMBER.slice(3, 6)} ${WHATSAPP_RAW_NUMBER.slice(6, 9)} ${WHATSAPP_RAW_NUMBER.slice(9)}`
    : `+${WHATSAPP_RAW_NUMBER}`);

/**
 * Builds a direct wa.me link with optional pre-filled inquiry text
 */
export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_RAW_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

