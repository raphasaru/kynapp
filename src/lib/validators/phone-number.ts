import { z } from 'zod';

/**
 * Brazilian phone number schema
 * Format: 55 + 2-digit DDD + optional 9 + 8 digits
 * Example: 5511912345678 or 551112345678
 */
export const phoneNumberSchema = z.string()
  .regex(/^55\d{2}9?\d{8}$/, 'Número de telefone inválido');

/**
 * Format raw phone string for API
 * Strips non-digits, prepends 55 if needed
 * @param raw - Phone string in any format
 * @returns Formatted phone with country code (5511999999999)
 */
export function formatPhoneForAPI(raw: string): string {
  // Strip all non-digits
  const digits = raw.replace(/\D/g, '');

  // If already has country code (starts with 55), return as-is
  if (digits.startsWith('55')) {
    return digits;
  }

  // Otherwise prepend 55
  return '55' + digits;
}

/**
 * Format phone for display
 * @param phone - Phone with country code (5511999999999)
 * @returns Formatted display string (11) 91234-5678
 */
export function formatPhoneForDisplay(phone: string): string {
  // Remove country code (55)
  const withoutCountry = phone.replace(/^55/, '');

  // Extract parts: DD (2 digits) + number (9 or 8 digits)
  const ddd = withoutCountry.slice(0, 2);
  const rest = withoutCountry.slice(2);

  // Format: (DD) 9XXXX-XXXX or (DD) XXXX-XXXX
  if (rest.length === 9) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  } else {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
}
