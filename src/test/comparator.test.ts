import * as assert from 'assert';
import { findMissingKeys } from '../comparator';
import { KeyUsage } from '../codeScanner';

suite('Comparator Test Suite', () => {
    test('should find missing keys', () => {
        const usedKeys = new Map<string, KeyUsage[]>([
            ['key1', [{ key: 'key1', filePath: '/test/file1.ts', line: 10 }]],
            ['key2', [{ key: 'key2', filePath: '/test/file2.ts', line: 20 }]],
            ['key3', [{ key: 'key3', filePath: '/test/file3.ts', line: 30 }]]
        ]);

        const localizationKeys = new Set(['key1', 'key3']);

        const missingKeys = findMissingKeys(usedKeys, localizationKeys);

        assert.strictEqual(missingKeys.size, 1);
        assert.ok(missingKeys.has('key2'));
        assert.strictEqual(missingKeys.get('key2')![0].filePath, '/test/file2.ts');
    });

    test('should return empty map when no keys are missing', () => {
        const usedKeys = new Map<string, KeyUsage[]>([
            ['key1', [{ key: 'key1', filePath: '/test/file1.ts', line: 10 }]],
            ['key2', [{ key: 'key2', filePath: '/test/file2.ts', line: 20 }]]
        ]);

        const localizationKeys = new Set(['key1', 'key2', 'key3']);

        const missingKeys = findMissingKeys(usedKeys, localizationKeys);

        assert.strictEqual(missingKeys.size, 0);
    });

    test('should handle multiple usages of same missing key', () => {
        const usedKeys = new Map<string, KeyUsage[]>([
            ['missing.key', [
                { key: 'missing.key', filePath: '/test/file1.ts', line: 10 },
                { key: 'missing.key', filePath: '/test/file2.ts', line: 15 },
                { key: 'missing.key', filePath: '/test/file1.ts', line: 25 }
            ]]
        ]);

        const localizationKeys = new Set(['other.key']);

        const missingKeys = findMissingKeys(usedKeys, localizationKeys);

        assert.strictEqual(missingKeys.size, 1);
        assert.ok(missingKeys.has('missing.key'));
        assert.strictEqual(missingKeys.get('missing.key')!.length, 3);
    });

    test('should handle empty used keys', () => {
        const usedKeys = new Map<string, KeyUsage[]>();
        const localizationKeys = new Set(['key1', 'key2']);

        const missingKeys = findMissingKeys(usedKeys, localizationKeys);

        assert.strictEqual(missingKeys.size, 0);
    });

    test('should handle empty localization keys', () => {
        const usedKeys = new Map<string, KeyUsage[]>([
            ['key1', [{ key: 'key1', filePath: '/test/file1.ts', line: 10 }]],
            ['key2', [{ key: 'key2', filePath: '/test/file2.ts', line: 20 }]]
        ]);

        const localizationKeys = new Set<string>();

        const missingKeys = findMissingKeys(usedKeys, localizationKeys);

        assert.strictEqual(missingKeys.size, 2);
        assert.ok(missingKeys.has('key1'));
        assert.ok(missingKeys.has('key2'));
    });

    test('should handle nested key notation', () => {
        const usedKeys = new Map<string, KeyUsage[]>([
            ['app.user.name', [{ key: 'app.user.name', filePath: '/test/file1.ts', line: 10 }]],
            ['app.user.email', [{ key: 'app.user.email', filePath: '/test/file2.ts', line: 20 }]],
            ['app.settings', [{ key: 'app.settings', filePath: '/test/file3.ts', line: 30 }]]
        ]);

        const localizationKeys = new Set(['app.user.name', 'app.user.email']);

        const missingKeys = findMissingKeys(usedKeys, localizationKeys);

        assert.strictEqual(missingKeys.size, 1);
        assert.ok(missingKeys.has('app.settings'));
    });

    test('should preserve all usage information for missing keys', () => {
        const usedKeys = new Map<string, KeyUsage[]>([
            ['missing', [
                { key: 'missing', filePath: '/src/component.tsx', line: 42 },
                { key: 'missing', filePath: '/src/utils.ts', line: 99 }
            ]]
        ]);

        const localizationKeys = new Set<string>();

        const missingKeys = findMissingKeys(usedKeys, localizationKeys);

        const usages = missingKeys.get('missing')!;
        assert.strictEqual(usages.length, 2);
        assert.strictEqual(usages[0].filePath, '/src/component.tsx');
        assert.strictEqual(usages[0].line, 42);
        assert.strictEqual(usages[1].filePath, '/src/utils.ts');
        assert.strictEqual(usages[1].line, 99);
    });
});
