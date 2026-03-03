import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('undefined_publisher.localizations-scanner'));
	});

	test('Should activate extension', async () => {
		const ext = vscode.extensions.getExtension('undefined_publisher.localizations-scanner');
		await ext?.activate();
		assert.ok(ext?.isActive);
	});

	test('Should register refresh command', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('localizationsScanner.refresh'));
	});

	test('Should register create config command', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('localizationsScanner.createConfig'));
	});
});

