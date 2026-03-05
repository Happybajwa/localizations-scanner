# Localization Scanner

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/devharry.localizations-scanner)](https://marketplace.visualstudio.com/items?itemName=devharry.localizations-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/Happybajwa/localizations-scanner)

Scan your codebase to detect missing localization keys and hardcoded strings that should be localized. Zero performance impact with on-demand scanning.

## Features

✅ **Missing Localization Keys** - Find keys used in code but missing from localization files  
✅ **Hardcoded Strings Detection** - Identify user-facing strings that should be localized  
✅ **Sidebar Integration** - Dedicated view with click-to-navigate  
✅ **On-Demand Scanning** - Zero performance impact, scans only when you click refresh  
✅ **Fully Configurable** - Customize patterns, file paths, and exclusions  
✅ **Smart Filtering** - Excludes test files, CSS classes, technical identifiers

## Installation

1. Open VS Code Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Search for **"Localization Scanner"**
3. Click **Install**

Or via command line:

```bash
code --install-extension devharry.localizations-scanner
```

## Quick Start

### 1. Create `scan.json` in your workspace root

```json
{
  "localizationFile": "src/locales/en.json",
  "include": ["src/**/*.{ts,tsx,js,jsx}"],
  "keyPattern": "\\bt\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignoreFilePaths": ["**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}"],
  "hardcodedStrings": {
    "enabled": true,
    "include": ["src/**/*.{ts,tsx}"],
    "ignoreFilePaths": ["**/*.test.{ts,tsx}", "src/constants.ts"],
    "minLength": 3,
    "ignoreStrings": ["test", "debug", "error"]
  }
}
```

### 2. Open Sidebar & Scan

- Click the globe icon (🌐) in the activity bar
- Click the refresh button (🔄) to scan

## Configuration

### Required Fields

| Field              | Description                              | Example                                  |
| ------------------ | ---------------------------------------- | ---------------------------------------- |
| `localizationFile` | Path to your localization JSON file      | `"src/locales/en.json"`                  |
| `include`          | Glob patterns for files to scan          | `["src/**/*.{ts,tsx}"]`                  |
| `keyPattern`       | Regex with capture group to extract keys | `"\\bt\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)"` |

### Optional Fields

| Field                              | Description                                     | Example                            |
| ---------------------------------- | ----------------------------------------------- | ---------------------------------- |
| `ignoreFilePaths`                  | Files to exclude from localization scanning     | `["**/*.test.ts", "src/demo.tsx"]` |
| `hardcodedStrings.enabled`         | Enable hardcoded string detection               | `true`                             |
| `hardcodedStrings.include`         | Files to scan for hardcoded strings             | `["src/**/*.tsx"]`                 |
| `hardcodedStrings.ignoreFilePaths` | Files to exclude from hardcoded string scanning | `["src/constants.ts"]`             |
| `hardcodedStrings.minLength`       | Minimum string length to detect                 | `3`                                |
| `hardcodedStrings.ignoreStrings`   | Specific strings to ignore                      | `["test", "debug"]`                |

> **Note**: Both `ignoreFilePaths` arrays support glob patterns (`**/*.test.ts`) and direct file paths (`src/demo.tsx`)

### Framework Examples

<details>
<summary><b>React with i18next</b></summary>

```json
{
  "localizationFile": "src/i18n/en.json",
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "keyPattern": "\\bt\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignoreFilePaths": ["**/*.test.{js,jsx,ts,tsx}", "**/mocks/**"],
  "hardcodedStrings": {
    "enabled": true,
    "include": ["src/**/*.{tsx,jsx}"],
    "ignoreFilePaths": ["**/*.test.{tsx,jsx}", "src/constants/errorCodes.ts"],
    "minLength": 3
  }
}
```

</details>

<details>
<summary><b>Vue i18n</b></summary>

```json
{
  "localizationFile": "src/locales/en.json",
  "include": ["src/**/*.vue"],
  "keyPattern": "\\$t\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignoreFilePaths": ["**/__tests__/**"],
  "hardcodedStrings": {
    "enabled": true,
    "include": ["src/**/*.vue"],
    "minLength": 4
  }
}
```

</details>

<details>
<summary><b>Next.js with next-i18next</b></summary>

```json
{
  "localizationFile": "public/locales/en/common.json",
  "include": ["components/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}"],
  "keyPattern": "\\bt\\(['\"]([a-zA-Z0-9_.]+)['\"]\\)",
  "ignoreFilePaths": ["**/*.test.*", "**/*.spec.*"],
  "hardcodedStrings": {
    "enabled": true,
    "include": ["components/**/*.tsx", "pages/**/*.tsx"],
    "ignoreFilePaths": ["pages/api/**"],
    "ignoreStrings": ["SEO", "API", "URL"]
  }
}
```

</details>

## Hardcoded Strings Detection

Detects user-facing strings that should be localized with **85-90% accuracy**. Advanced filtering system minimizes false positives while catching genuine hardcoded text.

**✅ Detected:**

- Error messages, button labels, tooltips
- Form labels, placeholders, validation messages
- Page titles, headings, notifications
- JSX text content: `<button>Click Me</button>`

**❌ Filtered Out:**

- CSS classes (`btn-primary`, `bg-blue-500`)
- Technical identifiers (`userId`, `API_URL`)
- Import paths (`"../Types"`, `"./constants"`)
- Styled-components CSS values (`"1px solid var(--color-grey30)"`)
- TypeScript syntax (`Promise<void>`, `FC<Props>`)

**Tips:**

- Always review results before making changes
- Add domain-specific terms to `ignoreStrings`
- Use `ignoreFilePaths` to exclude constant files
- [Report false positives](https://github.com/Happybajwa/localizations-scanner/issues) to help improve accuracy

## Commands

| Command                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| **Refresh**            | Rescan codebase for missing keys and hardcoded strings |
| **Create scan.json**   | Generate configuration template                        |
| **Export Diagnostics** | Export detection results to JSON                       |

## Example Output

**Code:**

```typescript
const message = t('welcome.message');
const title = t('home.title');
const button = <button>Click Me</button>;
```

**en.json:**

```json
{
  "welcome": {
    "message": "Welcome!"
  }
}
```

**Results:**

- ❌ Missing Key: `home.title` (used in App.tsx:5)
- ⚠️ Hardcoded String: `"Click Me"` (found in Button.tsx:12)

## Contributing

Contributions welcome!

**Repository:** [github.com/Happybajwa/localizations-scanner](https://github.com/Happybajwa/localizations-scanner)

### Development Setup

```bash
git clone https://github.com/Happybajwa/localizations-scanner.git
cd localizations-scanner
npm install
npm run compile
# Press F5 in VS Code to launch extension
```

### Test Workspace

Extract `examples/test-workspace.zip` to test with 70+ edge cases and patterns.

## Support

- 🐛 [Report Issues](https://github.com/Happybajwa/localizations-scanner/issues)
- 💡 [Feature Requests](https://github.com/Happybajwa/localizations-scanner/issues)
- 📧 Email: devharry2024@gmail.com

## License

MIT License - see [LICENSE](LICENSE) file

---

**Made with ❤️ by dev_harry** | [Marketplace](https://marketplace.visualstudio.com/items?itemName=devharry.localizations-scanner) | [GitHub](https://github.com/Happybajwa/localizations-scanner)
