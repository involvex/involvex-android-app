/**
 * Type Guard Utilities
 *
 * Safe type extraction from Record<string, unknown> objects
 * Used for parsing API responses and database rows
 */

/**
 * Safely extract a string value from an object
 */
export function getString(
  obj: Record<string, unknown>,
  key: string,
  defaultValue = '',
): string {
  const value = obj[key];
  if (typeof value === 'string') return value;
  if (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'toString' in value
  ) {
    return String(value);
  }
  return defaultValue;
}

/**
 * Safely extract a number value from an object
 */
export function getNumber(
  obj: Record<string, unknown>,
  key: string,
  defaultValue = 0,
): number {
  const value = obj[key];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Safely extract a boolean value from an object
 */
export function getBoolean(
  obj: Record<string, unknown>,
  key: string,
  defaultValue = false,
): boolean {
  const value = obj[key];
  if (typeof value === 'boolean') return value;
  return defaultValue;
}

/**
 * Safely extract a Date value from an object
 */
export function getDate(
  obj: Record<string, unknown>,
  key: string,
  defaultValue?: Date,
): Date {
  const value = obj[key];
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue || new Date() : date;
  }
  return defaultValue || new Date();
}

/**
 * Safely extract a string or null value from an object
 */
export function getStringOrNull(
  obj: Record<string, unknown>,
  key: string,
): string | null {
  const value = obj[key];
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'toString' in value) return String(value);
  return null;
}

/**
 * Safely extract a number or null value from an object
 */
export function getNumberOrNull(
  obj: Record<string, unknown>,
  key: string,
): number | null {
  const value = obj[key];
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Safely extract a Date or null value from an object
 */
export function getDateOrNull(
  obj: Record<string, unknown>,
  key: string,
): Date | null {
  const value = obj[key];
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Safely extract a nested object from an object
 */
export function getNestedObject<T = Record<string, unknown>>(
  obj: Record<string, unknown>,
  key: string,
): T | null {
  const value = obj[key];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  return null;
}

/**
 * Safely extract an array from an object
 */
export function getArray<T = unknown>(
  obj: Record<string, unknown>,
  key: string,
): T[] {
  const value = obj[key];
  if (Array.isArray(value)) return value as T[];
  return [];
}

/**
 * Safely extract a string from a nested object path
 * e.g., getNestedString(json, 'owner', 'login', 'default')
 */
export function getNestedString(
  obj: Record<string, unknown>,
  parentKey: string,
  childKey: string,
  defaultValue = '',
): string {
  const parent = getNestedObject(obj, parentKey);
  if (!parent) return defaultValue;
  return getString(parent, childKey, defaultValue);
}

/**
 * Safely extract a string array and join with a delimiter
 */
export function getStringArrayJoined(
  obj: Record<string, unknown>,
  key: string,
  delimiter = ',',
): string | null {
  const arr = getArray<string>(obj, key);
  if (arr.length === 0) return null;
  return arr.join(delimiter);
}
