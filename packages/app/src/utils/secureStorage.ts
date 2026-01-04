/**
 * Secure Storage Utility
 *
 * Wrapper around react-native-keychain for encrypted storage of sensitive data
 * like API keys, tokens, and credentials.
 *
 * Uses device keychain (iOS) or KeyStore (Android) for hardware-backed encryption.
 */

import * as Keychain from 'react-native-keychain';

/**
 * Secure storage keys
 */
export const SecureKeys = {
  GEMINI_API_KEY: '@secure:gemini_api_key',
  GEMINI_MODEL: '@secure:gemini_model',
  OLLAMA_ENDPOINT: '@secure:ollama_endpoint',
  OLLAMA_MODEL: '@secure:ollama_model',
  OPENROUTER_API_KEY: '@secure:openrouter_api_key',
} as const;

export type SecureKeyType = (typeof SecureKeys)[keyof typeof SecureKeys];

/**
 * Store a value securely in the device keychain
 */
export async function setSecureValue(
  key: SecureKeyType,
  value: string,
): Promise<boolean> {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieve a value from the device keychain
 */
export async function getSecureValue(
  key: SecureKeyType,
): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: key,
    });

    if (credentials && typeof credentials !== 'boolean') {
      return credentials.password;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Delete a value from the device keychain
 */
export async function deleteSecureValue(key: SecureKeyType): Promise<boolean> {
  try {
    await Keychain.resetGenericPassword({
      service: key,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a secure value exists
 */
export async function hasSecureValue(key: SecureKeyType): Promise<boolean> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: key,
    });
    return credentials !== false;
  } catch {
    return false;
  }
}

/**
 * Clear all secure storage (use with caution)
 */
export async function clearAllSecureStorage(): Promise<boolean> {
  try {
    const keys = Object.values(SecureKeys);
    const results = await Promise.all(keys.map(key => deleteSecureValue(key)));
    return results.every(result => result);
  } catch {
    return false;
  }
}

/**
 * Mask a sensitive value for display in UI
 * e.g., "sk-1234567890abcdef" -> "sk-••••••••••••cdef"
 */
export function maskSensitiveValue(value: string | null): string {
  if (!value || value.length < 8) {
    return '••••••••';
  }

  const visibleChars = 4;
  const prefix = value.substring(0, visibleChars);
  const suffix = value.substring(value.length - visibleChars);
  const masked = '•'.repeat(Math.max(8, value.length - visibleChars * 2));

  return `${prefix}${masked}${suffix}`;
}

/**
 * Validate API key format
 */
export function validateApiKey(
  provider: 'gemini' | 'ollama',
  value: string,
): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  switch (provider) {
    case 'gemini':
      // Gemini API keys typically start with "AIza"
      if (!value.startsWith('AIza')) {
        return {
          valid: false,
          error: 'Gemini API key should start with "AIza"',
        };
      }
      if (value.length < 39) {
        return { valid: false, error: 'Gemini API key is too short' };
      }
      break;

    case 'ollama':
      // Ollama endpoint is a URL
      try {
        const url = new URL(value);
        const protocol = (url as any).protocol || (url.href ? url.href.split(':')[0] + ':' : '');
        if (protocol && !protocol.startsWith('http')) {
          return { valid: false, error: 'URL must use http or https' };
        }
      } catch {
        return { valid: false, error: 'Invalid URL format' };
      }
      break;
  }

  return { valid: true };
}
