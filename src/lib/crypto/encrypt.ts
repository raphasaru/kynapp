import { getEncryptionKey } from './keys';
import { ENCRYPTED_FIELDS } from './fields';

/**
 * Encrypt plaintext string using AES-256-GCM
 * Returns base64-encoded string (IV + ciphertext)
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Combine IV (12 bytes) + ciphertext, encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt base64-encoded string to plaintext
 */
export async function decrypt(encrypted: string): Promise<string> {
  const key = await getEncryptionKey();
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}

/**
 * Encrypt a numeric value (stored as TEXT in DB)
 */
export async function encryptNumber(value: number): Promise<string> {
  return encrypt(value.toString());
}

/**
 * Decrypt to number
 */
export async function decryptNumber(encrypted: string): Promise<number> {
  const plaintext = await decrypt(encrypted);
  return parseFloat(plaintext);
}

/**
 * Encrypt multiple fields of an object based on ENCRYPTED_FIELDS map
 * @param tableName Table name (e.g., 'transactions')
 * @param data Object with fields to encrypt
 * @returns New object with encrypted fields
 */
export async function encryptFields<T extends Record<string, any>>(
  tableName: string,
  data: T
): Promise<T> {
  const fieldMap = ENCRYPTED_FIELDS[tableName];
  if (!fieldMap) return data;

  const encrypted = { ...data } as any;

  for (const [field, type] of Object.entries(fieldMap)) {
    if (data[field] !== undefined && data[field] !== null) {
      if (type === 'number') {
        encrypted[field] = await encryptNumber(data[field] as number);
      } else {
        encrypted[field] = await encrypt(data[field] as string);
      }
    }
  }

  return encrypted as T;
}

/**
 * Decrypt multiple fields of an object
 * @param tableName Table name
 * @param data Object with encrypted fields
 * @returns New object with decrypted fields
 */
export async function decryptFields<T extends Record<string, any>>(
  tableName: string,
  data: T
): Promise<T> {
  const fieldMap = ENCRYPTED_FIELDS[tableName];
  if (!fieldMap) return data;

  const decrypted = { ...data } as any;

  for (const [field, type] of Object.entries(fieldMap)) {
    if (data[field] !== undefined && data[field] !== null) {
      try {
        if (type === 'number') {
          decrypted[field] = await decryptNumber(data[field] as string);
        } else {
          decrypted[field] = await decrypt(data[field] as string);
        }
      } catch {
        // Decryption failed — value may be plaintext (e.g. inserted by external service)
        const raw = data[field];
        if (type === 'number') {
          const parsed = typeof raw === 'number' ? raw : parseFloat(raw);
          decrypted[field] = isNaN(parsed) ? 0 : parsed;
        }
        // For strings, keep value as-is (already a string)
      }
    }
  }

  return decrypted as T;
}
