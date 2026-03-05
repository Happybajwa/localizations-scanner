# Localization Scanner

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/devharry.localizations-scanner)](https://marketplace.visualstudio.com/items?itemName=devharry.localizations-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/Happybajwa/localizations-scanner)

A lightweight, high-performance Visual Studio Code extension that scans your codebase to detect localization keys used in source files but missing from your main localization file.

> **Note**: This extension includes optional hardcoded string detection to help identify strings that should be localized. While highly accurate (~95-98%), automated detection is not perfect and should be used as a guide. Always review results manually before making changes. [Learn more about accuracy](#hardcoded-strings-detection)

## Features

- **Detect Missing Keys**: Automatically finds localization keys used in your code that are missing from your localization file
- **Detect Hardcoded Strings**: Identifies hardcoded user-facing strings in your codebase that should be localized (configurable)
- **Zero Performance Impact**: Scans only on-demand when you click refresh - no background watchers or file system monitoring
- **Sidebar View**: Displays missing keys and hardcoded strings in a dedicated sidebar with an intuitive tree structure
- **Quick Navigation**: Click on any missing key or hardcoded string to jump directly to its location in your code
- **Highly Configurable**: Customize file patterns, key patterns, and localization file location via `scan.json`
- **Smart Filtering**: Exclude test files, mocks, and other unwanted directories from scanning
- **Intelligent Detection**: Advanced filtering to minimize false positives for hardcoded strings (technical identifiers, CSS values, etc.)
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
  "keyPattern": "\\bt\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignore": ["**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}"],
  "hardcodedStrings": {
    "enabled": true,
    "minLength": 3,
    "ignoreStrings": ["test", "debug", "error", "warning", "info"]
  }
}
```

> **Note**: The pattern above matches single and double quotes. To also match template literals (backticks), use: `['"`]`

Or use the "Create scan.json" button in the sidebar to generate a template.

### 2. Configure Settings

**Required Settings:**
- **localizationFile**: Path to your main localization JSON file (relative to workspace root)
- **include**: Array of glob patterns to match files you want to scan
- **keyPattern**: Regular expression with a capture group to extract keys from code
- **ignore** (optional): Array of glob patterns to exclude from scanning (e.g., test files, mocks)

**Hardcoded Strings Detection (Optional):**
- **hardcodedStrings.enabled**: Set to `true` to enable hardcoded string detection
- **hardcodedStrings.minLength**: Minimum string length to detect (default: 3)
- **hardcodedStrings.ignoreStrings**: Array of specific strings to ignore

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

## Hardcoded Strings Detection

The extension can detect hardcoded strings in your code that should potentially be localized. This feature uses advanced pattern matching and intelligent filtering to identify user-facing strings.

### How It Works

The detector scans string literals in your code and applies over 20 different filters to distinguish between:
- **User-facing content** (e.g., error messages, button labels, page titles) ✅ Detected
- **Technical identifiers** (e.g., CSS classes, variable names, API endpoints) ❌ Filtered out

### Accuracy Notice

**Important**: While the hardcoded strings detector achieves approximately 95-98% accuracy in distinguishing user-facing strings from technical content, it is not perfect. 

**Why detection may not be 100% accurate:**

1. **Context Limitations**: Static analysis cannot always determine the intent or usage context of a string
2. **Domain-Specific Terms**: Technical terms in your domain might be detected as user-facing content
3. **Edge Cases**: Unusual coding patterns or mixed contexts may produce false positives or negatives
4. **Language Ambiguity**: Strings that serve dual purposes (technical and user-facing) require human judgment

**What gets filtered out (not detected):**
- CSS class names, IDs, and data attributes (`main-content`, `btn-primary`)
- Environment variables and constants (`REACT_APP_API_URL`, `NODE_ENV`)
- Technical identifiers (camelCase, snake_case, kebab-case)
- API endpoints, URLs, and file paths (`/api/users`, `https://example.com`)
- CSS values and properties (`16px`, `flex`, `rgba(0,0,0,0.5)`)
- Localization keys already in use (`user.profile.name`)
- DOM API calls (`createElement("div")`)
- Storage keys, query parameters
- Date/time formats (`MM/DD/YYYY`, `HH:mm:ss`)
- Email addresses, currency codes, version numbers
- Font families, regex patterns
- Single-word technical terms

**What gets detected:**
- Error and success messages
- Button labels and tooltips
- Form field labels and placeholders
- Page titles and headings
- Empty state messages
- Validation messages
- User notifications
- Aria-labels and accessibility text
- JSX text content

### Recommendations

1. **Review Results**: Always manually review detected strings before localizing
2. **Configure Ignore List**: Add domain-specific terms to `hardcodedStrings.ignoreStrings` in your `scan.json`
3. **Report Issues**: If you find patterns that should be filtered or detected differently, please [open an issue](https://github.com/Happybajwa/localizations-scanner/issues)
4. **Use as a Guide**: Treat detection results as suggestions rather than absolute requirements

## Configuration Examples

### React i18next

```json
{
  "localizationFile": "src/i18n/en.json",
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "keyPattern": "\\bt\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignore": ["**/*.test.{js,jsx,ts,tsx}", "**/mocks/**"],
  "hardcodedStrings": {
    "enabled": true,
    "minLength": 3,
    "ignoreStrings": ["test", "mock", "debug"]
  }
}
```

### Vue i18n

```json
{
  "localizationFile": "src/locales/en.json",
  "include": ["src/**/*.vue"],
  "keyPattern": "\\$t\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignore": ["**/__tests__/**"],
  "hardcodedStrings": {
    "enabled": true,
    "minLength": 4
  }
}
```

### Next.js with next-i18next

```json
{
  "localizationFile": "public/locales/en/common.json",
  "include": ["components/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}"],
  "keyPattern": "\\bt\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignore": ["**/*.test.*", "**/*.spec.*"],
  "hardcodedStrings": {
    "enabled": true,
    "minLength": 3,
    "ignoreStrings": ["SEO", "API", "URL"]
  }
}
```

## Commands

- **Refresh**: Rescans the codebase for missing keys and hardcoded strings
- **Create scan.json**: Creates a template configuration file
- **Export Diagnostics**: Exports detailed detection results to JSON files for analysis (when hardcoded strings are detected)

## Requirements

- VS Code 1.109.0 or higher
- A workspace with source files and a localization JSON file

## Known Limitations

### Missing Keys Detection
- Only supports a single base localization file
- Does not automatically insert missing keys (intentional design choice)
- Keys must follow the pattern defined in `keyPattern`

### Hardcoded Strings Detection
- **Not 100% accurate**: Achieves ~95-98% accuracy in distinguishing user-facing strings from technical identifiers
- **Context-dependent**: Cannot determine semantic meaning or usage context with complete certainty
- **May produce false positives**: Some technical strings with natural language appearance may be flagged
- **May miss some strings**: Dynamically constructed strings or unusual patterns may not be detected
- **Language-specific**: Optimized for English; other languages may have different patterns
- **Requires review**: Always manually review detected strings before taking action

**We continuously improve detection accuracy. If you encounter patterns that should be handled differently, please [report them](https://github.com/Happybajwa/localizations-scanner/issues) so we can enhance the filters.**

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

### Test Workspace

A comprehensive test workspace is included in the `examples/` directory:
- Extract `examples/test-workspace.zip` 
- Open the extracted folder in VS Code
- Test the extension with 70+ edge cases and patterns
- Use it to verify your changes and new filter patterns

See [examples/README.md](examples/README.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Feedback

We value your feedback and contributions to making this extension better!

### Report Issues

Found a bug or false positive in hardcoded string detection? Please help us improve:

- 🐛 **[Report a Bug](https://github.com/Happybajwa/localizations-scanner/issues)** - Include code examples when reporting detection issues
- 💡 **[Request a Feature](https://github.com/Happybajwa/localizations-scanner/issues)** - Suggest improvements or new capabilities
- 📝 **[Improve Detection](https://github.com/Happybajwa/localizations-scanner/issues)** - Share patterns that should be filtered or detected

### When Reporting Detection Issues

To help us improve accuracy, please include:
1. The string that was incorrectly detected or missed
2. The surrounding code context (a few lines before and after)
3. Why it should or shouldn't be detected (e.g., "This is a CSS class" or "This is user-facing text")
4. Your `scan.json` configuration (if relevant)

### Contact

- 📧 Email: devharry2024@gmail.com
- 💬 GitHub Discussions: [Start a conversation](https://github.com/Happybajwa/localizations-scanner/discussions)

Your feedback helps make this tool more accurate and useful for the entire community!

## Release Notes

### 1.1.0 (Coming Soon)

New features:
- **Hardcoded Strings Detection**: Automatically detect hardcoded user-facing strings that should be localized
- **Advanced Filtering**: 20+ intelligent filters to minimize false positives (~95-98% accuracy)
- **Export Diagnostics**: Export detailed detection results to JSON for analysis
- **Enhanced Sidebar**: Dual view showing both missing keys and hardcoded strings
- **Configurable Detection**: Enable/disable, set minimum length, add ignore patterns
- Comprehensive documentation with accuracy guidelines

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
