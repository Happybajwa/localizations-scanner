import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface HardcodedStringsConfig {
    enabled: boolean;
    include?: string[];  // Files to scan for hardcoded strings (glob patterns or file paths). Defaults to main include if not specified.
    ignoreFilePaths?: string[];   // Files to EXCLUDE from hardcoded string scanning (glob patterns or file paths like "src/demo.tsx")
    ignoreStrings?: string[];  // Specific string content to ignore (e.g., ["test", "debug"])
    minLength?: number;
}

export interface ScanConfig {
    localizationFile: string;
    include: string[];   // Files to scan for missing localization keys (glob patterns)
    keyPattern: string;  // Regex pattern to extract localization keys from code
    ignoreFilePaths?: string[];   // Files to EXCLUDE from localization scanning (glob patterns or file paths like "src/locales/en-NZ.json")
    hardcodedStrings?: HardcodedStringsConfig;
}

/**
 * Loads and validates the scan.json configuration file from the workspace root.
 * @param workspaceRoot The absolute path to the workspace root directory
 * @returns The validated configuration object
 * @throws Error if scan.json is missing or invalid
 */
export function loadConfig(workspaceRoot: string): ScanConfig {
    const configPath = path.join(workspaceRoot, 'scan.json');

    if (!fs.existsSync(configPath)) {
        throw new Error('scan.json not found in workspace root. Please create one to configure the scanner.');
    }

    const configContent = fs.readFileSync(configPath, 'utf-8');
    let config: any;

    try {
        config = JSON.parse(configContent);
    } catch (error) {
        throw new Error(`Invalid JSON in scan.json: ${error instanceof Error ? error.message : 'unknown error'}`);
    }

    validateConfig(config);

    return config as ScanConfig;
}

/**
 * Validates that the configuration object has all required properties.
 * @param config The configuration object to validate
 * @throws Error if any required property is missing or invalid
 */
function validateConfig(config: any): void {
    if (!config.localizationFile || typeof config.localizationFile !== 'string') {
        throw new Error('scan.json must contain a "localizationFile" string property');
    }

    if (!Array.isArray(config.include) || config.include.length === 0) {
        throw new Error('scan.json must contain an "include" array with at least one glob pattern');
    }

    if (!config.keyPattern || typeof config.keyPattern !== 'string') {
        throw new Error('scan.json must contain a "keyPattern" string property');
    }

    if (config.ignoreFilePaths !== undefined && !Array.isArray(config.ignoreFilePaths)) {
        throw new Error('scan.json "ignoreFilePaths" property must be an array if provided');
    }

    // Validate that keyPattern contains a capture group
    try {
        const regex = new RegExp(config.keyPattern);
        const testMatch = regex.exec("t('test.key')");
        if (!testMatch || testMatch.length < 2) {
            throw new Error('keyPattern must contain at least one capture group');
        }
    } catch (error) {
        throw new Error(`Invalid regex pattern in keyPattern: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
}

/**
 * Prompts the user to create a scan.json file if it doesn't exist.
 */
export async function promptCreateConfig(): Promise<void> {
    const action = await vscode.window.showWarningMessage(
        'scan.json not found in workspace root. Would you like to create one?',
        'Create scan.json',
        'Cancel'
    );

    if (action === 'Create scan.json') {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const configPath = path.join(workspaceRoot, 'scan.json');

        const defaultConfig: ScanConfig = {
            localizationFile: 'src/locales/en-NZ.json',
            include: ['src/**/*.{ts,tsx,js,jsx}'],
            keyPattern: '\\bt\\([\'"`]([a-zA-Z0-9_.]+)[\'"`]\\)',
            ignoreFilePaths: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],  // Files to ignore for LOCALIZATION scanning
            hardcodedStrings: {
                enabled: false,
                include: ['src/**/*.{ts,tsx,js,jsx}'],
                ignoreFilePaths: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],  // Files to ignore for HARDCODED STRING scanning
                minLength: 3,
                ignoreStrings: ['test', 'debug', 'error', 'warning', 'info']
            }
        };

        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');

        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage('scan.json created successfully. Please update it with your project settings.');
    }
}
