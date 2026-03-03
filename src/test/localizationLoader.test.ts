import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadLocalizationKeys } from '../localizationLoader';

suite('Localization Loader Test Suite', () => {
    let tempDir: string;
    let testFilePath: string;

    setup(() => {
        // Create temporary directory for test files
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'localization-test-'));
        testFilePath = path.join(tempDir, 'test.json');
    });

    teardown(() => {
        // Clean up temporary files
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir);
        }
    });

    test('should load flat localization file', () => {
        const testData = {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
        };
        fs.writeFileSync(testFilePath, JSON.stringify(testData), 'utf-8');

        const keys = loadLocalizationKeys(testFilePath);

        assert.strictEqual(keys.size, 3);
        assert.ok(keys.has('key1'));
        assert.ok(keys.has('key2'));
        assert.ok(keys.has('key3'));
    });

    test('should flatten nested localization file', () => {
        const testData = {
            welcome: {
                message: 'Welcome!',
                title: 'Hello'
            },
            home: {
                header: 'Home Page'
            }
        };
        fs.writeFileSync(testFilePath, JSON.stringify(testData), 'utf-8');

        const keys = loadLocalizationKeys(testFilePath);

        assert.strictEqual(keys.size, 3);
        assert.ok(keys.has('welcome.message'));
        assert.ok(keys.has('welcome.title'));
        assert.ok(keys.has('home.header'));
    });

    test('should flatten deeply nested localization file', () => {
        const testData = {
            app: {
                user: {
                    profile: {
                        name: 'Name',
                        email: 'Email'
                    }
                }
            }
        };
        fs.writeFileSync(testFilePath, JSON.stringify(testData), 'utf-8');

        const keys = loadLocalizationKeys(testFilePath);

        assert.strictEqual(keys.size, 2);
        assert.ok(keys.has('app.user.profile.name'));
        assert.ok(keys.has('app.user.profile.email'));
    });

    test('should handle arrays as leaf values', () => {
        const testData = {
            items: ['item1', 'item2'],
            nested: {
                list: ['a', 'b', 'c']
            }
        };
        fs.writeFileSync(testFilePath, JSON.stringify(testData), 'utf-8');

        const keys = loadLocalizationKeys(testFilePath);

        assert.strictEqual(keys.size, 2);
        assert.ok(keys.has('items'));
        assert.ok(keys.has('nested.list'));
    });

    test('should handle null values', () => {
        const testData = {
            key1: 'value',
            key2: null
        };
        fs.writeFileSync(testFilePath, JSON.stringify(testData), 'utf-8');

        const keys = loadLocalizationKeys(testFilePath);

        assert.strictEqual(keys.size, 2);
        assert.ok(keys.has('key1'));
        assert.ok(keys.has('key2'));
    });

    test('should throw error for non-existent file', () => {
        const nonExistentPath = path.join(tempDir, 'does-not-exist.json');

        assert.throws(
            () => loadLocalizationKeys(nonExistentPath),
            /Localization file not found/
        );
    });

    test('should throw error for invalid JSON', () => {
        fs.writeFileSync(testFilePath, '{ invalid json }', 'utf-8');

        assert.throws(
            () => loadLocalizationKeys(testFilePath),
            /Invalid JSON in localization file/
        );
    });

    test('should handle empty object', () => {
        fs.writeFileSync(testFilePath, '{}', 'utf-8');

        const keys = loadLocalizationKeys(testFilePath);

        assert.strictEqual(keys.size, 0);
    });
});
