# Change Log

All notable changes to the Localization Scanner extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-05

### Added
- **Hardcoded Strings Detection** (Major Feature)
  - Automatically detect user-facing hardcoded strings in your codebase
  - Intelligent filtering system with 20+ filter types to reduce false positives
  - Achieves ~95-98% accuracy through context-aware detection
  - Configurable via `hardcodedStrings` section in `scan.json`
  - Opt-in feature (disabled by default)

- **Advanced Filtering System**
  - Localization key detection (dot notation: `user.profile.name`)
  - Already localized strings (inside `t()`, `i18n.t()`, `translate()` calls)
  - CSS identifiers (kebab-case, grid templates, functions, shorthands)
  - Technical identifiers (camelCase, snake_case, ALL_CAPS, single words)
  - DOM API calls (15 APIs, 40 HTML elements, 20 event names)
  - Method arguments (searchParams, localStorage, sessionStorage, Object methods)
  - Date/time formats (MM/DD/YYYY, HH:mm:ss, etc.)
  - Email addresses, currency codes, font families
  - Version numbers (semver), regex patterns
  - Import/export statements, proper names, technical keywords

- **Enhanced Tree View**
  - Dual-section sidebar: "Missing Keys" and "Hardcoded Strings"
  - Group hardcoded strings by content with occurrence count badges
  - Expand to see all file locations with line numbers
  - Click to navigate to exact location (file, line, column)
  - Empty state indicators when no issues found

- **Export Diagnostics Command**
  - Export detailed JSON reports for hardcoded strings
  - Includes diagnostics file with all detections and locations
  - Includes summary file with statistics and breakdown
  - Useful for code reviews and team reporting

- **Environment File Protection**
  - Automatically excludes `.env`, `.env.*`, `env`, and `*.env` files from scanning
  - Prevents accidental scanning of sensitive environment variables
  - Applied to both missing keys and hardcoded strings detection

- **Comprehensive Documentation**
  - New "Hardcoded Strings Detection" section in README
  - Transparent accuracy notice (~95-98%) with explanations
  - Detailed "What Gets Filtered Out" guide with 20+ categories
  - Enhanced "Support & Feedback" section with bug reporting guidelines
  - Test workspace packaged for contributors (`examples/test-workspace.zip`)
  - Professional funding configuration (GitHub Sponsors + Buy Me a Coffee)

### Changed
- Removed all console logging statements for cleaner production code
- Updated configuration examples across all framework documentation
- Enhanced default `scan.json` template with hardcoded strings configuration

### Technical Improvements
- Built with TypeScript following SOLID principles
- Regex-based detection with 4 pattern types (double quotes, single quotes, template literals, JSX text)
- Pure functions for filtering logic
- Modular architecture with separated detection, filtering, and UI layers
- Comprehensive test workspace with 11 files and 70+ edge cases

### Performance
- Efficient scanning using fast-glob with intelligent exclusions
- Minimal false positives through context-aware filtering
- Non-blocking UI with progress reporting

## [1.0.4] - 2026-03-04

### Fixed
- Fixed README markdown rendering issue on VS Code Marketplace
- Simplified regex pattern examples to prevent backticks being rendered as links
- Added note about template literal support

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