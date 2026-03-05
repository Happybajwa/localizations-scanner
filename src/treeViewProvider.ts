import * as vscode from 'vscode';
import * as path from 'path';
import { KeyUsage } from './codeScanner';
import { HardcodedString } from './hardcodedStringDetector';

export class MissingKeysTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private missingKeys: Map<string, KeyUsage[]> = new Map();
    private hardcodedStrings: Map<string, HardcodedString[]> = new Map();

    constructor() { }

    /**
     * Updates the missing keys data and refreshes the tree view.
     * @param missingKeys Map of missing keys to their usage locations
     */
    updateMissingKeys(missingKeys: Map<string, KeyUsage[]>): void {
        this.missingKeys = missingKeys;
        this.refresh();
    }

    /**
     * Updates the hardcoded strings data and refreshes the tree view.
     * @param hardcodedStrings Map of files to their hardcoded strings
     */
    updateHardcodedStrings(hardcodedStrings: Map<string, HardcodedString[]>): void {
        this.hardcodedStrings = hardcodedStrings;
        this.refresh();
    }

    /**
     * Triggers a refresh of the tree view.
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!element) {
            // Root level - show sections
            const items: TreeItem[] = [];

            // Missing keys section
            const missingKeysCount = this.missingKeys.size;
            if (missingKeysCount > 0) {
                items.push(new SectionTreeItem('Missing Keys', missingKeysCount, 'missingKeys'));
            }

            // Hardcoded strings section
            const hardcodedCount = Array.from(this.hardcodedStrings.values())
                .reduce((sum, strings) => sum + strings.length, 0);
            if (hardcodedCount > 0) {
                items.push(new SectionTreeItem('Hardcoded Strings', hardcodedCount, 'hardcodedStrings'));
            }

            if (items.length === 0) {
                return Promise.resolve([new EmptyTreeItem()]);
            }

            return Promise.resolve(items);
        } else if (element instanceof SectionTreeItem) {
            // Section level - show keys or strings
            if (element.section === 'missingKeys') {
                const items: TreeItem[] = [];
                for (const [key, usages] of this.missingKeys.entries()) {
                    items.push(new KeyTreeItem(key, usages));
                }
                items.sort((a, b) => a.label.toString().localeCompare(b.label.toString()));
                return Promise.resolve(items);
            } else if (element.section === 'hardcodedStrings') {
                const items: TreeItem[] = [];
                for (const [file, strings] of this.hardcodedStrings.entries()) {
                    // Group by unique string content
                    const stringMap = new Map<string, HardcodedString[]>();
                    for (const str of strings) {
                        if (!stringMap.has(str.content)) {
                            stringMap.set(str.content, []);
                        }
                        stringMap.get(str.content)!.push(str);
                    }
                    for (const [content, occurrences] of stringMap.entries()) {
                        items.push(new HardcodedStringTreeItem(content, occurrences));
                    }
                }
                items.sort((a, b) => a.label.toString().localeCompare(b.label.toString()));
                return Promise.resolve(items);
            }
        } else if (element instanceof KeyTreeItem) {
            // Child level - show file usages for missing keys
            const fileItems = element.usages.map(usage => new FileTreeItem(usage));
            return Promise.resolve(fileItems);
        } else if (element instanceof HardcodedStringTreeItem) {
            // Child level - show file usages for hardcoded strings
            const fileItems = element.occurrences.map(str => new HardcodedFileTreeItem(str));
            return Promise.resolve(fileItems);
        }

        return Promise.resolve([]);
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}

class SectionTreeItem extends TreeItem {
    constructor(
        public readonly sectionLabel: string,
        public readonly count: number,
        public readonly section: 'missingKeys' | 'hardcodedStrings'
    ) {
        super(sectionLabel, vscode.TreeItemCollapsibleState.Expanded);
        this.description = `${count}`;
        this.iconPath = section === 'missingKeys' 
            ? new vscode.ThemeIcon('warning', new vscode.ThemeColor('problemsWarningIcon.foreground'))
            : new vscode.ThemeIcon('info', new vscode.ThemeColor('problemsInfoIcon.foreground'));
        this.contextValue = 'section';
    }
}

class EmptyTreeItem extends TreeItem {
    constructor() {
        super('✓ No issues found', vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
        this.contextValue = 'empty';
    }
}

class KeyTreeItem extends TreeItem {
    constructor(
        public readonly key: string,
        public readonly usages: KeyUsage[]
    ) {
        super(key, vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = `Missing key: ${key}\nUsed in ${usages.length} location(s)`;
        this.description = `(${usages.length})`;
        this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('problemsWarningIcon.foreground'));
        this.contextValue = 'missingKey';
    }
}

class HardcodedStringTreeItem extends TreeItem {
    constructor(
        public readonly content: string,
        public readonly occurrences: HardcodedString[]
    ) {
        const displayContent = content.length > 30 ? content.substring(0, 30) + '...' : content;
        super(`"${displayContent}"`, vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = `Hardcoded string: "${content}"\nFound in ${occurrences.length} location(s)`;
        this.description = `(${occurrences.length})`;
        this.iconPath = new vscode.ThemeIcon('quote', new vscode.ThemeColor('problemsInfoIcon.foreground'));
        this.contextValue = 'hardcodedString';
    }
}

class FileTreeItem extends TreeItem {
    constructor(public readonly usage: KeyUsage) {
        const fileName = path.basename(usage.filePath);
        super(`${fileName}:${usage.line}`, vscode.TreeItemCollapsibleState.None);

        this.tooltip = usage.filePath;
        this.description = path.dirname(usage.filePath).split(path.sep).slice(-2).join(path.sep);
        this.iconPath = vscode.ThemeIcon.File;
        this.contextValue = 'fileUsage';

        // Command to open the file at the specific line
        this.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [
                vscode.Uri.file(usage.filePath),
                {
                    selection: new vscode.Range(
                        new vscode.Position(usage.line - 1, 0),
                        new vscode.Position(usage.line - 1, 0)
                    )
                }
            ]
        };
    }
}

class HardcodedFileTreeItem extends TreeItem {
    constructor(public readonly hardcodedString: HardcodedString) {
        const fileName = path.basename(hardcodedString.file);
        super(`${fileName}:${hardcodedString.line}`, vscode.TreeItemCollapsibleState.None);

        this.tooltip = `${hardcodedString.file}\nContext: ${hardcodedString.context}`;
        this.description = `[${hardcodedString.context}]`;
        this.iconPath = vscode.ThemeIcon.File;
        this.contextValue = 'hardcodedFileUsage';

        // Command to open the file at the specific line
        this.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [
                vscode.Uri.file(hardcodedString.file),
                {
                    selection: new vscode.Range(
                        new vscode.Position(hardcodedString.line - 1, hardcodedString.column - 1),
                        new vscode.Position(hardcodedString.line - 1, hardcodedString.column - 1)
                    )
                }
            ]
        };
    }
}
