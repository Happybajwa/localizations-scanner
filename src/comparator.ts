import { KeyUsage } from './codeScanner';

/**
 * Compares used keys against existing localization keys to find missing ones.
 * This is a pure function with no side effects.
 * @param usedKeys Map of keys found in code to their usage locations
 * @param localizationKeys Set of keys present in the localization file
 * @returns Map of missing keys to their usage locations
 */
export function findMissingKeys(
  usedKeys: Map<string, KeyUsage[]>,
  localizationKeys: Set<string>
): Map<string, KeyUsage[]> {
  const missingKeys = new Map<string, KeyUsage[]>();

  for (const [key, usages] of usedKeys.entries()) {
    if (!localizationKeys.has(key)) {
      missingKeys.set(key, usages);
    }
  }

  return missingKeys;
}
