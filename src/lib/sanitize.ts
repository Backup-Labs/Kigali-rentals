/**
 * Strict input sanitization utilities to prevent XSS, HTML injection,
 * script protocol injection, and control character abuse.
 */
export function sanitizePlainText(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove null bytes and non-printable control characters (except newline/tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip all HTML / XML tags completely
    .replace(/<[^>]*>?/gm, '')
    // Strip dangerous protocol schemes
    .replace(/(javascript|data|vbscript|file):/gi, '')
    // Strip inline event handler patterns
    .replace(/\bon\w+\s*=/gi, '')
    // Encode angle brackets and backticks if any remain
    .replace(/[<>`]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x20<>()[\]\\,;:"'`]/g, '')
    .trim()
    .toLowerCase()
    .slice(0, 120);
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 120) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

