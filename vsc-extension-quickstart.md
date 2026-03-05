# Localization Scanner - Extension Development

Quick guide for developing and testing the Localization Scanner extension.

## Project Structure

```
src/
├── extension.ts                 # Extension entry point & activation
├── config.ts                    # Load & validate scan.json
├── codeScanner.ts              # Scan codebase for localization keys
├── hardcodedStringDetector.ts  # Detect hardcoded strings
├── missingKeysTreeProvider.ts  # Sidebar tree view
├── diagnosticsProvider.ts      # Problems panel integration
└── test/                       # Unit & integration tests
```

## Tech Stack

- **TypeScript** (strict mode)
- **esbuild** (bundler)
- **fast-glob** (file scanning)
- **VS Code Extension API** (1.109.0+)

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Build & Watch
```bash
npm run watch
```

Or run the default build task: `Ctrl+Shift+B`

### 3. Launch Extension
Press **F5** to open Extension Development Host with:
- Extension loaded
- Debugger attached
- Breakpoints enabled

### 4. Test Changes
- Modify code in `src/`
- Extension recompiles automatically (watch mode)
- Reload Extension Host: `Ctrl+R` / `Cmd+R`

## Testing

### Run Tests
```bash
npm test
```

### Watch Tests
```bash
npm run watch-tests
```

### Test Workspace
Extract `examples/test-workspace.zip` for 70+ test cases covering:
- Missing localization keys
- Hardcoded string detection
- Edge cases and false positives

## Build & Package

### Compile
```bash
npm run compile
```
Runs: type checking → linting → bundling

### Package Extension
```bash
vsce package
```
Creates: `localizations-scanner-{version}.vsix`

### Publish
```bash
vsce publish
```

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Extension manifest, commands, views, configuration |
| `tsconfig.json` | TypeScript strict mode configuration |
| `esbuild.js` | Bundle configuration (minification, tree-shaking) |
| `eslint.config.mjs` | ESLint rules for code quality |
| `scan.json.example` | Template configuration for users |

## Debugging

### Extension
- Set breakpoints in `src/extension.ts`
- Press **F5** to start debugging
- View output in Debug Console

### Tests
- Set breakpoints in `src/test/*.test.ts`
- Run tests via Test Explorer
- View results in Test Results panel

## Common Tasks

### Add New Command
1. Register in `package.json` → `contributes.commands`
2. Implement in `src/extension.ts` → `activate()`
3. Add keyboard shortcut (optional) → `contributes.keybindings`

### Add Configuration Option
1. Define in `package.json` → `contributes.configuration`
2. Update interfaces in `src/config.ts`
3. Load in `loadConfig()` function
4. Update `scan.json.example`

### Fix False Positive
1. Identify pattern causing false positive
2. Add filter in `src/hardcodedStringDetector.ts`
3. Add test case in `src/test/`
4. Update CHANGELOG.md

## Design Principles

- **SOLID principles** - Single responsibility, dependency inversion
- **DRY** - Reusable utility functions
- **Pure functions** - Core logic separate from VS Code API
- **Explicit types** - No `any` unless unavoidable
- **Performance** - On-demand scanning, efficient data structures

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Tree View API](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Diagnostic API](https://code.visualstudio.com/api/references/vscode-api#Diagnostic)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Need Help?

- [Report Issues](https://github.com/Happybajwa/localizations-scanner/issues)

---

**Happy coding!** 🚀
