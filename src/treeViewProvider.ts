import * as vscode from 'vscode';
import * as path from 'path';
import { KeyUsage } from './codeScanner';

export class MissingKeysTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private missingKeys: Map<string, KeyUsage[]> = new Map();

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
            // Root level - show keys
            if (this.missingKeys.size === 0) {
                return Promise.resolve([]);
            }

            const items: TreeItem[] = [];
            for (const [key, usages] of this.missingKeys.entries()) {
                items.push(new KeyTreeItem(key, usages));
            }

            // Sort keys alphabetically
            items.sort((a, b) => a.label.toString().localeCompare(b.label.toString()));
            return Promise.resolve(items);
        } else if (element instanceof KeyTreeItem) {
            // Child level - show file usages
            const fileItems = element.usages.map(usage => new FileTreeItem(usage));
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
