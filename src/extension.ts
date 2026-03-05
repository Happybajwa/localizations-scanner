import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { loadConfig, promptCreateConfig } from './config';
import { loadLocalizationKeys } from './localizationLoader';
import { scanCodebase } from './codeScanner';
import { findMissingKeys } from './comparator';
import { MissingKeysTreeProvider } from './treeViewProvider';
import { detectHardcodedStrings } from './hardcodedStringDetector';

// Store last scan results for diagnostics
let lastHardcodedStrings: Map<string, any[]> = new Map();

export function activate(context: vscode.ExtensionContext) {
	// Create tree view provider
	const treeProvider = new MissingKeysTreeProvider();
	const treeView = vscode.window.createTreeView('localizationsScanner.missingKeys', {
		treeDataProvider: treeProvider,
		showCollapseAll: true
	});

	// Register refresh command
	const refreshCommand = vscode.commands.registerCommand('localizationsScanner.refresh', async () => {
		await scanForMissingKeys(treeProvider);
	});

	// Register create config command
	const createConfigCommand = vscode.commands.registerCommand('localizationsScanner.createConfig', async () => {
		await promptCreateConfig();
	});

	// Register export diagnostics command
	const exportDiagnosticsCommand = vscode.commands.registerCommand('localizationsScanner.exportDiagnostics', async () => {
		await exportDiagnostics();
	});

	context.subscriptions.push(treeView, refreshCommand, createConfigCommand, exportDiagnosticsCommand);

	// Initial scan
	scanForMissingKeys(treeProvider);
}

async function scanForMissingKeys(treeProvider: MissingKeysTreeProvider): Promise<void> {
	try {
		// Get workspace root
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showWarningMessage('No workspace folder is open');
			return;
		}

		const workspaceRoot = workspaceFolders[0].uri.fsPath;

		// Show progress
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Scanning for localizations',
				cancellable: false
			},
			async (progress) => {
				// Load configuration
				progress.report({ message: 'Loading configuration...' });
				const config = loadConfig(workspaceRoot);

				// Load localization file
				progress.report({ message: 'Loading localization file...' });
				const localizationFilePath = path.join(workspaceRoot, config.localizationFile);
				const localizationKeys = loadLocalizationKeys(localizationFilePath);

				// Scan codebase for missing keys
				progress.report({ message: 'Scanning for missing keys...' });
				const usedKeys = await scanCodebase(workspaceRoot, config.include, config.keyPattern, config.ignoreFilePaths);
				progress.report({ message: 'Comparing keys...' });
				const missingKeys = findMissingKeys(usedKeys, localizationKeys);

				// Update tree view with missing keys
				treeProvider.updateMissingKeys(missingKeys);

				// Scan for hardcoded strings if enabled
				let hardcodedStrings = new Map();
				if (config.hardcodedStrings?.enabled) {
					progress.report({ message: 'Scanning for hardcoded strings...' });
					hardcodedStrings = await detectHardcodedStrings(workspaceRoot, config, config.hardcodedStrings);
					// Store for diagnostics
					lastHardcodedStrings = hardcodedStrings;
					treeProvider.updateHardcodedStrings(hardcodedStrings);
				} else {
					lastHardcodedStrings = new Map();
					treeProvider.updateHardcodedStrings(new Map());
				}

				// Show result
				const hardcodedCount = Array.from(hardcodedStrings.values())
					.reduce((sum, strings) => sum + strings.length, 0);

				if (missingKeys.size === 0 && hardcodedCount === 0) {
					vscode.window.showInformationMessage('✓ No localization issues found!');
				} else {
					const messages: string[] = [];
					if (missingKeys.size > 0) {
						messages.push(`${missingKeys.size} missing key(s)`);
					}
					if (hardcodedCount > 0) {
						messages.push(`${hardcodedCount} hardcoded string(s)`);
					}
					vscode.window.showWarningMessage(`Found: ${messages.join(', ')}`);
				}
			}
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		if (errorMessage.includes('scan.json not found')) {
			// Prompt to create config
			const action = await vscode.window.showErrorMessage(
				errorMessage,
				'Create scan.json'
			);

			if (action === 'Create scan.json') {
				await promptCreateConfig();
			}
		} else {
			vscode.window.showErrorMessage(`Localization Scanner Error: ${errorMessage}`);
		}

		// Clear tree view on error
		treeProvider.updateMissingKeys(new Map());
		treeProvider.updateHardcodedStrings(new Map());
	}
}

async function exportDiagnostics(): Promise<void> {
	try {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showWarningMessage('No workspace folder is open');
			return;
		}

		const workspaceRoot = workspaceFolders[0].uri.fsPath;

		if (lastHardcodedStrings.size === 0) {
			vscode.window.showInformationMessage('No hardcoded strings detected yet. Run a scan first.');
			return;
		}

		// Convert Map to array for better readability
		const diagnostics: any[] = [];
		let totalCount = 0;

		lastHardcodedStrings.forEach((strings, file) => {
			strings.forEach((str: any) => {
				diagnostics.push({
					file,
					line: str.line,
					column: str.column,
					content: str.content,
					context: str.context
				});
				totalCount++;
			});
		});

		// Sort by file and line
		diagnostics.sort((a, b) => {
			if (a.file !== b.file) {
				return a.file.localeCompare(b.file);
			}
			return a.line - b.line;
		});

		// Write to diagnostics file
		const outputPath = path.join(workspaceRoot, 'hardcoded-strings-diagnostics.json');
		fs.writeFileSync(outputPath, JSON.stringify(diagnostics, null, 2), 'utf-8');

		// Also create a summary
		const summary = {
			totalStrings: totalCount,
			totalFiles: lastHardcodedStrings.size,
			byFile: {} as Record<string, number>
		};

		lastHardcodedStrings.forEach((strings, file) => {
			summary.byFile[file] = strings.length;
		});

		const summaryPath = path.join(workspaceRoot, 'hardcoded-strings-summary.json');
		fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

		const action = await vscode.window.showInformationMessage(
			`Exported ${totalCount} detections to diagnostics files`,
			'Open Diagnostics',
			'Open Summary'
		);

		if (action === 'Open Diagnostics') {
			const doc = await vscode.workspace.openTextDocument(outputPath);
			await vscode.window.showTextDocument(doc);
		} else if (action === 'Open Summary') {
			const doc = await vscode.workspace.openTextDocument(summaryPath);
			await vscode.window.showTextDocument(doc);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		vscode.window.showErrorMessage(`Failed to export diagnostics: ${errorMessage}`);
	}
}

export function deactivate() { }
