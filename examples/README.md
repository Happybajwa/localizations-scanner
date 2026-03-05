# Examples

This directory contains example projects and configurations for the Localization Scanner extension.

## Test Workspace

**File**: `test-workspace.zip`

A comprehensive test workspace that demonstrates both missing keys detection and hardcoded strings detection. This workspace is used for development and testing of the extension.

### What's Included

The test workspace contains:

- **Source Files**: 11 TypeScript/TSX files with various hardcoded strings and localization patterns
- **Test Cases**: Edge cases, complex patterns, styled components, template literals
- **Configuration**: Example `scan.json` with hardcoded strings detection enabled
- **Localization File**: Sample `en-NZ.json` with existing translations

### How to Use

1. Extract `test-workspace.zip` to a location on your computer
2. Open the extracted folder in VS Code
3. Install the Localization Scanner extension
4. Open the Localization Scanner sidebar (globe icon)
5. Click the refresh button to scan

### What to Expect

When you scan the test workspace, you should see:
- **Missing Keys**: ~4 missing localization keys (keys used in code but not in en-NZ.json)
- **Hardcoded Strings**: ~70 hardcoded user-facing strings that should be localized

The workspace deliberately includes various patterns to test the detector's accuracy:
- ✅ User-facing strings (error messages, labels, titles)
- ❌ Technical strings that should be filtered (CSS classes, API endpoints, constants)
- ❌ Already localized strings (inside t() calls)
- ❌ Technical identifiers (camelCase, snake_case, kebab-case)

### For Contributors

This test workspace is valuable for:
- Testing new filter patterns
- Verifying detection accuracy
- Reproducing reported bugs
- Benchmarking performance improvements

If you're contributing to the project, you can modify the test files to add new edge cases or patterns, and run the scanner to ensure filters work correctly.

## Contributing

Found an edge case that should be added to the test workspace? Please open an issue or pull request!
