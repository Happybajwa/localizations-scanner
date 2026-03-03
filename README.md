# Localization Scanner

A Visual Studio Code extension that scans your codebase to detect localization keys used in source files but missing from your main localization file.

## Features

- **Detect Missing Keys**: Automatically finds localization keys used in your code that are missing from your localization file
- **Sidebar View**: Displays missing keys in a dedicated sidebar with an intuitive tree structure
- **Quick Navigation**: Click on any missing key to jump directly to its usage location in your code
- **Configurable Scanning**: Customize file patterns, key patterns, and localization file location via `scan.json`
- **Real-time Updates**: Refresh on demand to get the latest scan results

## Getting Started

### 1. Create Configuration File

Create a `scan.json` file in your workspace root:

```json
{
  "localizationFile": "src/locales/en-NZ.json",
  "include": ["src/**/*.{ts,tsx,js,jsx}"],
  "keyPattern": "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)",
  "ignore": ["**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}"]
}
```

Or use the "Create scan.json" button in the sidebar to generate a template.

### 2. Configure Settings

- **localizationFile**: Path to your main localization JSON file (relative to workspace root)
- **include**: Array of glob patterns to match files you want to scan
- **keyPattern**: Regular expression with a capture group to extract keys from code
- **ignore** (optional): Array of glob patterns to exclude from scanning (e.g., test files, mocks)

### 3. Open the Sidebar

Click the globe icon (🌐) in the VS Code activity bar to open the Localization Scanner sidebar.

### 4. Scan for Missing Keys

Click the refresh button (🔄) in the sidebar to scan your codebase.

## Example Usage

If your code uses localization like this:

```typescript
const message = t('welcome.message');
const title = t('home.title');
```

And your `en-NZ.json` only contains:

```json
{
  "welcome": {
    "message": "Welcome!"
  }
}
```

The extension will identify `home.title` as a missing key and display it in the sidebar.

## Configuration Examples

### React i18next

```json
{
  "localizationFile": "src/i18n/en.json",
  "include": ["src/**/*.{js,jsx,ts,tsx}"],,
  "ignore": ["**/*.test.{js,jsx,ts,tsx}", "**/mocks/**"]
}
```

### Vue i18n

```json
{
  "localizationFile": "src/locales/en.json",
  "include": ["src/**/*.vue"],
  "keyPattern": "\\$t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)",
  "ignore": ["**/__tests__/**"]
  "keyPattern": "\\$t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)"
}
```

## Commands

- **Refresh**: Rescans the codebase for missing keys
- **Create scan.json**: Creates a template configuration file

## Requirements

- VS Code 1.109.0 or higher
- A workspace with source files and a localization JSON file

## Known Limitations

- Only supports a single base localization file
- Does not automatically insert missing keys
- Keys must follow the pattern defined in `keyPattern`

## Release Notes

### 0.0.1

Initial release:
- Scan codebase for missing localization keys
- Display results in sidebar tree view
- Navigate to key usage locations
- Configurable via scan.json

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
