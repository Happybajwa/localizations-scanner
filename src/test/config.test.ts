import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig } from '../config';

suite('Config Test Suite', () => {
    let tempDir: string;
    let configPath: string;

    setup(() => {
        // Create temporary directory for test files
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
        configPath = path.join(tempDir, 'scan.json');
    });

    teardown(() => {
        // Clean up temporary files
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir);
        }
    });

    test('should load valid configuration', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            include: ['src/**/*.ts'],
            keyPattern: "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)"
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        const config = loadConfig(tempDir);

        assert.strictEqual(config.localizationFile, 'src/locales/en.json');
        assert.strictEqual(config.include.length, 1);
        assert.strictEqual(config.include[0], 'src/**/*.ts');
        assert.strictEqual(config.keyPattern, "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)");
    });

    test('should load configuration with ignore patterns', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            include: ['src/**/*.ts'],
            keyPattern: "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)",
            ignoreFilePaths: ['**/*.test.ts', '**/*.spec.ts']
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        const config = loadConfig(tempDir);

        assert.ok(config.ignoreFilePaths);
        assert.strictEqual(config.ignoreFilePaths!.length, 2);
        assert.strictEqual(config.ignoreFilePaths![0], '**/*.test.ts');
    });

    test('should throw error when scan.json not found', () => {
        assert.throws(
            () => loadConfig(tempDir),
            /scan.json not found in workspace root/
        );
    });

    test('should throw error for invalid JSON', () => {
        fs.writeFileSync(configPath, '{ invalid json', 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /Invalid JSON in scan.json/
        );
    });

    test('should throw error when localizationFile is missing', () => {
        const testConfig = {
            include: ['src/**/*.ts'],
            keyPattern: "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)"
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /must contain a "localizationFile" string property/
        );
    });

    test('should throw error when localizationFile is not a string', () => {
        const testConfig = {
            localizationFile: 123,
            include: ['src/**/*.ts'],
            keyPattern: "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)"
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /must contain a "localizationFile" string property/
        );
    });

    test('should throw error when include is missing', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            keyPattern: "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)"
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /must contain an "include" array with at least one glob pattern/
        );
    });

    test('should throw error when include is empty array', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            include: [],
            keyPattern: "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)"
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /must contain an "include" array with at least one glob pattern/
        );
    });

    test('should throw error when keyPattern is missing', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            include: ['src/**/*.ts']
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /must contain a "keyPattern" string property/
        );
    });

    test('should throw error when ignore is not an array', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            include: ['src/**/*.ts'],
            keyPattern: "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)",
            ignore: 'not-an-array'
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /"ignore" property must be an array if provided/
        );
    });

    test('should throw error when keyPattern has no capture group', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            include: ['src/**/*.ts'],
            keyPattern: "t\\(['\"`][a-zA-Z0-9_.]+['\"`]\\)" // No capture group
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /keyPattern must contain at least one capture group/
        );
    });

    test('should throw error for invalid regex pattern', () => {
        const testConfig = {
            localizationFile: 'src/locales/en.json',
            include: ['src/**/*.ts'],
            keyPattern: "t\\([" // Invalid regex
        };
        fs.writeFileSync(configPath, JSON.stringify(testConfig), 'utf-8');

        assert.throws(
            () => loadConfig(tempDir),
            /Invalid regex pattern in keyPattern/
        );
    });
});
