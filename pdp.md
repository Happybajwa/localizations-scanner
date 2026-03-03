# Product Design Plan (PDP)

## Project: Localization Scanner VS Code Extension

---

# 1. Project Overview

## 1.1 Project Name

Localization Scanner

## 1.2 Description

A Visual Studio Code extension built strictly in TypeScript that scans a codebase to detect localization keys used in source files but missing from a designated main localization file (e.g., en-NZ.json).

The extension presents missing keys inside a dedicated sidebar view in VS Code. It does not modify files automatically. It only reports missing keys.

---

# 2. Problem Statement

In large codebases, localization keys are frequently used in UI components (e.g., via t('key')).

Developers often:

* Add new keys in code
* Forget to add them to the main localization file
* Manually search for missing keys
* Waste time mapping keys across files

There is currently no lightweight, configurable tool that:

* Uses a single source of truth
* Scans dynamically
* Displays missing keys in an integrated VS Code sidebar

This leads to:

* Missing translations in production
* Runtime UI issues
* Manual and error-prone verification

---

# 3. Goals

1. Allow configuration through scan.json in workspace root
2. Use one main localization file as the source of truth
3. Scan entire codebase using configurable include patterns
4. Extract localization keys using configurable regex pattern
5. Compare used keys against existing keys
6. Display only missing keys in a sidebar view
7. Allow clicking to navigate to file locations

Non-goals:

* No automatic key insertion
* No code formatting
* No modification of localization file
* No support for multiple base localization files

---

# 4. Configuration Design

## 4.1 scan.json (Required)

Example:

```json
{
  "localizationFile": "src/locales/en-NZ.json",
  "include": ["src/**/*.{ts,tsx,js,jsx}"],
  "keyPattern": "t\\(['\"`]([a-zA-Z0-9_.]+)['\"`]\\)"
}
```

Rules:

* localizationFile must point to a JSON file
* include must use glob patterns
* keyPattern must contain a single capture group for key extraction

If scan.json does not exist:

* Show warning
* Prompt user to create one

---

# 5. Technical Architecture

## 5.1 Technology Stack

* TypeScript (strict mode enabled)
* Node.js runtime (provided by VS Code)
* esbuild (bundler)
* fast-glob (file scanning)
* Native fs and path modules

No additional frameworks.

---

# 6. Core Modules

## 6.1 Configuration Loader

Responsibility:

* Locate scan.json
* Validate required properties
* Return typed configuration object

Principle:
Single Responsibility Principle (SRP)

---

## 6.2 Localization Loader

Responsibility:

* Read localization file
* Parse JSON
* Flatten nested keys into dot notation

No side effects beyond reading.

---

## 6.3 Code Scanner

Responsibility:

* Use include patterns
* Parse files
* Extract used keys using regex
* Track file locations

Output:
Map<string, string[]>

---

## 6.4 Comparator

Responsibility:

* Compare used keys with localization keys
* Produce missing key map

Pure function.

---

## 6.5 Tree View Provider

Responsibility:

* Render missing keys
* Render files as children
* Refresh on command

No scanning logic inside UI provider.

---

# 7. Data Flow

1. User opens sidebar
2. Extension loads scan.json
3. Localization file is flattened
4. Codebase scanned
5. Used keys collected
6. Missing keys computed
7. Sidebar tree rendered

---

# 8. Design Principles

## 8.1 DRY (Don't Repeat Yourself)

* Flatten logic defined once
* Key extraction logic reusable
* Pure utilities separated from VS Code API layer

## 8.2 SOLID Principles

### S - Single Responsibility

Each module performs one job only.

### O - Open/Closed

Scanner supports configurable key pattern without code changes.

### L - Liskov Substitution

Not heavily applicable; avoid inheritance unless necessary.

### I - Interface Segregation

Use minimal internal interfaces for configuration and scan results.

### D - Dependency Inversion

Core logic does not depend on VS Code APIs.
UI layer depends on core logic.

---

# 9. TypeScript Standards

* Strict mode enabled
* No any unless unavoidable
* Explicit return types
* Interfaces for configuration
* Utility functions must be pure where possible
* Avoid unnecessary generics

Example:

```ts
interface ScanConfig {
  localizationFile: string;
  include: string[];
  keyPattern: string;
}
```

---

# 10. Code Style Guidelines

* No over-engineering
* No abstractions unless necessary
* Keep functions small
* Comment only where required
* Do not comment obvious logic
* Avoid deeply nested conditionals
* Early returns preferred

---

# 11. Performance Considerations

* Use async file operations where reasonable
* Avoid re-reading localization file repeatedly
* Use Set for O(1) lookups
* Debounce refresh if adding auto-watch later

---

# 12. Error Handling

Handle only expected errors:

* Missing scan.json
* Invalid JSON
* Invalid glob patterns
* Missing localization file

Do not suppress errors silently.

---

# 13. Future Extensions (Not in Scope Now)

* Detect unused localization keys
* Auto-add missing keys
* Watch mode
* Support for multiple base files
* Inline editor diagnostics

---

# 14. Acceptance Criteria

* Extension appears in sidebar
* scan.json required
* Only missing keys shown
* Clicking a
