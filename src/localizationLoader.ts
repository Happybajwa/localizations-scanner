import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads and flattens a localization JSON file.
 * @param filePath The absolute path to the localization file
 * @returns A Set of all flattened keys in the localization file
 * @throws Error if the file doesn't exist or contains invalid JSON
 */
export function loadLocalizationKeys(filePath: string): Set<string> {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Localization file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let localizationData: any;

    try {
        localizationData = JSON.parse(content);
    } catch (error) {
        throw new Error(`Invalid JSON in localization file: ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    const keys = flattenKeys(localizationData);
    return new Set(keys);
}

/**
 * Flattens a nested object into an array of dot-notation keys.
 * @param obj The object to flatten
 * @param prefix The current key prefix (used for recursion)
 * @returns An array of flattened keys
 */
function flattenKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }

        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            // Recursively flatten nested objects
            keys.push(...flattenKeys(value, fullKey));
        } else {
            // Add leaf keys
            keys.push(fullKey);
        }
    }

    return keys;
}
