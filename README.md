# Localization Scanner

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/devharry.localizations-scanner)](https://marketplace.visualstudio.com/items?itemName=devharry.localizations-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/Happybajwa/localizations-scanner)

A lightweight, high-performance Visual Studio Code extension that scans your codebase to detect localization keys used in source files but missing from your main localization file.

## Features

- **Detect Missing Keys**: Automatically finds localization keys used in your code that are missing from your localization file
- **Zero Performance Impact**: Scans only on-demand when you click refresh - no background watchers or file system monitoring
- **Sidebar View**: Displays missing keys in a dedicated sidebar with an intuitive tree structure
- **Quick Navigation**: Click on any missing key to jump directly to its usage location in your code
- **Highly Configurable**: Customize file patterns, key patterns, and localization file location via `scan.json`
- **Smart Filtering**: Exclude test files, mocks, and other unwanted directories from scanning
- **Deep Nesting Support**: Handles localization files with complex nested structures (up to 8 levels deep)

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS) to open Extensions
3. Search for "Localization Scanner"
4. Click **Install**

### From Command Line

```bash
code --install-extension devharry.localizations-scanner
```

### Marketplace

[📦 View on Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=devharry.localizations-scanner)

## Performance

This extension is designed with performance in mind:

- ✅ **On-Demand Scanning**: Only scans when you explicitly click the refresh button - no automatic background operations
- ✅ **Efficient File Processing**: Uses fast-glob for optimized file system operations with ignore patterns
- ✅ **Async Operations**: All file operations are asynchronous to prevent blocking VS Code
- ✅ **Smart Error Handling**: Gracefully skips unreadable files without impacting the scan
- ✅ **Minimal Memory Footprint**: Processes files incrementally without loading entire codebase into memory
- ✅ **No File Watchers**: Does not monitor file system changes, keeping resource usage minimal

**Result**: This extension has zero impact on VS Code startup time, editor responsiveness, or ongoing development workflow.

## Getting Started

### 1. Create Configuration File

Create a `scan.json` file in your workspace root:

```json
{
  "localizationFile": "src/locales/en-NZ.json",
  "include": ["src/**/*.{ts,tsx,js,jsx}"],
  "keyPattern": "\\bt\\(['"`]([a-zA-Z0-9_.]+)['"`]\\)",
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
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "keyPattern": "\\bt\\(['"`]([a-zA-Z0-9_.]+)['"`]\\)",
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
- Does not automatically insert missing keys (intentional design choice)
- Keys must follow the pattern defined in `keyPattern`

## Contributing

This is an open-source project! Contributions are welcome.

### Repository
- GitHub: [https://github.com/Happybajwa/localizations-scanner](https://github.com/Happybajwa/localizations-scanner)

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
git clone https://github.com/Happybajwa/localizations-scanner.git
cd localizations-scanner
npm install
npm run compile
```

Press F5 in VS Code to launch the extension in development mode.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report a Bug](https://github.com/Happybajwa/localizations-scanner/issues)
- 💡 [Request a Feature](https://github.com/Happybajwa/localizations-scanner/issues)
- 📧 Email: devharry2024@gmail.com

## Release Notes

### 1.0.0

Initial release:
- Scan codebase for missing localization keys
- Display results in sidebar tree view with counts
- Navigate to key usage locations with single click
- Configurable via scan.json with include/ignore patterns
- Support for deeply nested localization structures
- Zero performance impact with on-demand scanning
- Professional error handling and user feedback

---

**Made with ❤️ by dev_harry**

**Enjoy!**
