import * as vscode from 'vscode';
import * as path from 'path';
import { loadConfig, promptCreateConfig } from './config';
import { loadLocalizationKeys } from './localizationLoader';
import { scanCodebase } from './codeScanner';
import { findMissingKeys } from './comparator';
import { MissingKeysTreeProvider } from './treeViewProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Localizations Scanner is now active');

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

	context.subscriptions.push(treeView, refreshCommand, createConfigCommand);

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
				title: 'Scanning for missing localization keys',
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

				// Scan codebase
				progress.report({ message: 'Scanning codebase...' });
                const usedKeys = await scanCodebase(workspaceRoot, config.include, config.keyPattern, config.ignore);
				progress.report({ message: 'Comparing keys...' });
				const missingKeys = findMissingKeys(usedKeys, localizationKeys);

				// Update tree view
				treeProvider.updateMissingKeys(missingKeys);

				// Show result
				if (missingKeys.size === 0) {
					vscode.window.showInformationMessage('No missing localization keys found!');
				} else {
					vscode.window.showWarningMessage(
						`Found ${missingKeys.size} missing localization key(s)`
					);
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
	}
}

export function deactivate() { }
