import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';

export interface KeyUsage {
    key: string;
    filePath: string;
    line: number;
}

/**
 * Scans the codebase for localization key usage.
 * @param workspaceRoot The absolute path to the workspace root
 * @param includePatterns Array of glob patterns to match files
 * @param keyPattern Regex pattern with capture group to extract keys
 * @param ignoreFilePaths Optional array of file paths or glob patterns to ignore
 * @returns Map of keys to array of file paths where they are used
 */
export async function scanCodebase(
    workspaceRoot: string,
    includePatterns: string[],
    keyPattern: string,
    ignoreFilePaths?: string[]
): Promise<Map<string, KeyUsage[]>> {
    const keyUsageMap = new Map<string, KeyUsage[]>();
    const regex = new RegExp(keyPattern, 'g');

    // Find all matching files
    // Supports both glob patterns (**/*.test.tsx) and direct file paths (src/locales/en-NZ.json)
    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'];

    // Separate glob patterns from direct file paths
    const globPatterns: string[] = [];
    const directPaths: string[] = [];

    if (ignoreFilePaths) {
        for (const pattern of ignoreFilePaths) {
            if (pattern.includes('*') || pattern.includes('?') || pattern.includes('[')) {
                // It's a glob pattern
                globPatterns.push(pattern);
            } else {
                // It's a direct file path
                directPaths.push(pattern);
            }
        }
    }

    const allIgnorePatterns = [...defaultIgnore, ...globPatterns];

    let files = await fg(includePatterns, {
        cwd: workspaceRoot,
        absolute: true,
        ignore: allIgnorePatterns
    });

    // Filter out direct file paths (normalize paths for comparison)
    if (directPaths.length > 0) {
        const normalizedIgnorePaths = directPaths.map((p: string) => {
            // Normalize to use forward slashes and remove leading ./
            const normalized = path.normalize(path.join(workspaceRoot, p)).replace(/\\/g, '/');
            return normalized;
        });

        files = files.filter((file: string) => {
            const normalizedFile = file.replace(/\\/g, '/');
            return !normalizedIgnorePaths.some((ignorePath: string) =>
                normalizedFile === ignorePath || normalizedFile.endsWith('/' + ignorePath)
            );
        });
    }

    for (const filePath of files) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const usages = extractKeysFromFile(content, filePath, regex);

            for (const usage of usages) {
                if (!keyUsageMap.has(usage.key)) {
                    keyUsageMap.set(usage.key, []);
                }
                keyUsageMap.get(usage.key)!.push(usage);
            }
        } catch (error) {
            // Skip files that can't be read (binary, permission issues, etc.)
            continue;
        }
    }

    return keyUsageMap;
}

/**
 * Extracts localization keys from a single file's content.
 * @param content The file content to scan
 * @param filePath The absolute path to the file
 * @param regex The regex pattern to use for extraction
 * @returns Array of key usages found in the file
 */
function extractKeysFromFile(
    content: string,
    filePath: string,
    regex: RegExp
): KeyUsage[] {
    const usages: KeyUsage[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        // Reset regex lastIndex for each line
        regex.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
            if (match[1]) {
                usages.push({
                    key: match[1],
                    filePath,
                    line: index + 1 // Line numbers are 1-based
                });
            }
        }
    });

    return usages;
}
