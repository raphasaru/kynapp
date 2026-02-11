/**
 * Key derivation and management for AES-256-GCM encryption
 * Phase 1: Shared key from environment variable
 * Future: Per-user keys derived from password
 */

// Fixed salt for key derivation (generated once, hardcoded for consistency)
// crypto.getRandomValues(new Uint8Array(16))
const SALT = new Uint8Array([
  147, 219, 90, 234, 12, 45, 189, 234,
  78, 123, 45, 167, 234, 89, 12, 67
]);

let cachedKey: CryptoKey | null = null;

/**
 * Get or derive the encryption key from environment variable
 * Uses PBKDF2 to derive AES-256-GCM key from base64-encoded secret
 */
export async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const keyBase64 = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!keyBase64) {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY not configured');
  }

  // Decode base64 key
  const keyBytes = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));

  // Import as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key using PBKDF2
  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt']
  );

  return cachedKey;
}

/**
 * Derive a key from a password (for future per-user encryption)
 * @param password User password
 * @param salt Salt for key derivation
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
