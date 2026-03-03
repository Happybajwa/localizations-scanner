# Change Log

All notable changes to the Localization Scanner extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-03-04

### Fixed
- **Critical Bug Fix**: Added word boundary (`\b`) to default keyPattern to prevent false positives
- Pattern now correctly matches only `t('key')` function calls, not strings in other contexts like `split(".")` or `createElement("a")`
- Updated all documentation and examples with corrected pattern
- Updated scan.json.example with fixed pattern

## [1.0.2] - 2026-03-04

### Changed
- Internal version bump

## [1.0.1] - 2026-03-04

### Changed
- Enhanced README with comprehensive performance details
- Added installation instructions for VS Code Marketplace
- Improved documentation with open-source contribution guidelines
- Added professional badges and branding
- Fixed JSON syntax errors in configuration examples

## [1.0.0] - 2026-03-03

### Added
- **Core Functionality**
  - Scan codebase for localization keys used in source files
  - Detect missing keys by comparing against main localization file
  - Display missing keys in dedicated sidebar view
  - Navigate to key usage locations with single click

- **Configuration**
  - Configurable via `scan.json` file in workspace root
  - Support for custom file include patterns (glob patterns)
  - Support for custom key extraction regex patterns
  - Support for ignore patterns to exclude files (e.g., tests, mocks)
  - Helper command to create `scan.json` template

- **Tree View Features**
  - Hierarchical view of missing keys
  - Show usage count for each missing key
  - Expand keys to see all file locations
  - Click file locations to jump to specific line
  - Refresh button to rescan on demand

- **Localization File Support**
  - Support for nested JSON localization files
  - Automatic key flattening with dot notation
  - Handles complex nested structures

- **Developer Experience**
  - TypeScript strict mode for type safety
  - Comprehensive unit tests for core logic
  - Clear error messages for configuration issues
  - Progress notifications during scanning
  - Example configuration file included

### Technical Details
- Built with TypeScript following SOLID principles
- Uses fast-glob for efficient file scanning
- Modular architecture with separated concerns
- Pure functions for testability
- Full test coverage for core modules

### Supported Frameworks
- React i18next
- Vue i18n
- Any framework using similar localization patterns

---

## Future Enhancements (Planned)
- Auto-watch mode for real-time detection
- Detect unused localization keys
- Support for multiple base localization files
- Inline editor diagnostics
- Auto-add missing keys functionality