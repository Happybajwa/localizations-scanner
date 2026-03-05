import * as fs from 'fs';
import * as path from 'path';
import { ScanConfig } from './config';

export interface HardcodedString {
    content: string;
    file: string;
    line: number;
    column: number;
    context: string;
}

export interface HardcodedStringsConfig {
    enabled: boolean;
    ignoreStrings?: string[];
    minLength?: number;
}

/**
 * Detects hardcoded strings in the codebase using regex patterns
 */
export async function detectHardcodedStrings(
    workspaceRoot: string,
    config: ScanConfig,
    hardcodedConfig: HardcodedStringsConfig
): Promise<Map<string, HardcodedString[]>> {
    if (!hardcodedConfig.enabled) {
        return new Map();
    }

    const minLength = hardcodedConfig.minLength || 3;
    const ignoreStrings = hardcodedConfig.ignoreStrings || [];

    const results = new Map<string, HardcodedString[]>();

    try {
        const filesToScan = await getFilesToScan(workspaceRoot, config);

        for (const filePath of filesToScan) {
            const fileResults = await scanFileForStrings(filePath, minLength, ignoreStrings);

            if (fileResults.length > 0) {
                const relativePath = path.relative(workspaceRoot, filePath);
                results.set(relativePath, fileResults);
            }
        }
    } catch (error) {
        // Silently handle errors
    }

    return results;
}

/**
 * Scan a single file for hardcoded strings
 */
async function scanFileForStrings(
    filePath: string,
    minLength: number,
    ignorePatterns: string[]
): Promise<HardcodedString[]> {
    const results: HardcodedString[] = [];

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const lineNumber = lineIndex + 1;

            // Skip comments
            if (isCommentLine(line)) {
                continue;
            }

            // Skip import/require statements
            if (isImportOrRequireLine(line)) {
                continue;
            }

            // Extract all string literals from the line
            const strings = extractAllStrings(line, lineNumber);

            for (const str of strings) {
                // Apply filters
                if (
                    str.content.length >= minLength &&
                    !shouldIgnoreString(str.content, ignorePatterns, line) &&
                    !isLocalizationKey(str.content) &&
                    !isInsideLocalizationCall(line, str.content) &&
                    !isAttributeName(line, str.column) &&
                    !isDOMAPICall(line, str.content) &&
                    !isMethodArgument(line, str.content)
                ) {
                    results.push({
                        content: str.content,
                        file: filePath,
                        line: str.line,
                        column: str.column,
                        context: determineContext(line, str.content)
                    });
                }
            }
        }
    } catch (error) {
        // Skip files that can't be read
    }

    return results;
}

/**
 * Extract all string literals from a line
 */
function extractAllStrings(line: string, lineNumber: number): Array<{ content: string; line: number; column: number }> {
    const strings: Array<{ content: string; line: number; column: number }> = [];

    // Pattern for double-quoted strings
    const doubleQuoteRegex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
    let match;

    while ((match = doubleQuoteRegex.exec(line)) !== null) {
        strings.push({
            content: match[1],
            line: lineNumber,
            column: match.index + 1
        });
    }

    // Pattern for single-quoted strings
    const singleQuoteRegex = /'([^'\\]*(\\.[^'\\]*)*)'/g;
    while ((match = singleQuoteRegex.exec(line)) !== null) {
        strings.push({
            content: match[1],
            line: lineNumber,
            column: match.index + 1
        });
    }

    // Pattern for template literals (basic - doesn't handle nested)
    const templateRegex = /`([^`]*)`/g;
    while ((match = templateRegex.exec(line)) !== null) {
        const content = match[1];
        // Only include if it has actual text (not just variables)
        if (content && !/^\s*\$\{.*\}\s*$/.test(content) && content.trim().length > 0) {
            strings.push({
                content: content,
                line: lineNumber,
                column: match.index + 1
            });
        }
    }

    // Pattern for JSX text content
    const jsxTextRegex = />([^<{]+)</g;
    while ((match = jsxTextRegex.exec(line)) !== null) {
        const content = match[1].trim();
        if (content.length > 0) {
            strings.push({
                content: content,
                line: lineNumber,
                column: match.index + 1
            });
        }
    }

    return strings;
}

/**
 * Check if a line is a comment
 */
function isCommentLine(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
}

/**
 * Check if a line is an import or require statement
 */
function isImportOrRequireLine(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('import ') ||
        trimmed.includes('require(') ||
        trimmed.startsWith('export ') && trimmed.includes('from ');
}

/**
 * Check if string looks like a localization key
 */
function isLocalizationKey(content: string): boolean {
    // Keys typically use dot notation: user.profile.name
    // Require at least 2 dots (3 segments)
    return /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+){2,}$/.test(content);
}

/**
 * Check if string is an attribute name (className, id, etc.)
 */
function isAttributeName(line: string, column: number): boolean {
    const beforeString = line.substring(0, column);
    const attributePatterns = [
        /className\s*=\s*$/,
        /\bid\s*=\s*$/,
        /\bkey\s*=\s*$/,
        /data-[\w-]+\s*=\s*$/,
        /aria-[\w-]+\s*=\s*$/,
    ];

    return attributePatterns.some(pattern => pattern.test(beforeString));
}

/**
 * Check if string is part of a DOM API call
 */
function isDOMAPICall(line: string, content: string): boolean {
    // List of DOM/Web APIs that take string arguments (usually element names, event types, etc.)
    const domAPIs = [
        'createElement', 'createElementNS',
        'getElementById', 'getElementsByClassName', 'getElementsByTagName', 'getElementsByName',
        'querySelector', 'querySelectorAll',
        'addEventListener', 'removeEventListener',
        'dispatchEvent',
        'setAttribute', 'getAttribute', 'removeAttribute', 'hasAttribute',
        'getContext',
        'matchMedia',
        'requestAnimationFrame', 'cancelAnimationFrame'
    ];

    // Check if the line contains any of these API calls with the string
    for (const api of domAPIs) {
        if (line.includes(`${api}(`) && line.includes(`"${content}"`) || line.includes(`'${content}'`)) {
            return true;
        }
    }

    // Check for HTML element names
    const htmlElements = [
        'div', 'span', 'p', 'a', 'button', 'input', 'textarea', 'select', 'option',
        'form', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
        'img', 'video', 'audio', 'canvas', 'svg', 'iframe',
        'header', 'footer', 'nav', 'main', 'section', 'article', 'aside',
        'strong', 'em', 'code', 'pre', 'blockquote', 'hr', 'br'
    ];

    if (htmlElements.includes(content) && line.includes('createElement')) {
        return true;
    }

    // Check for common event names
    const eventNames = [
        'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave',
        'keydown', 'keyup', 'keypress',
        'focus', 'blur', 'change', 'input', 'submit', 'reset',
        'load', 'unload', 'resize', 'scroll',
        'touchstart', 'touchmove', 'touchend', 'touchcancel',
        'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'
    ];

    if (eventNames.includes(content) && (line.includes('addEventListener') || line.includes('removeEventListener'))) {
        return true;
    }

    return false;
}

/**
 * Check if string is a method argument (query params, keys, etc.)
 */
function isMethodArgument(line: string, content: string): boolean {
    // Common method patterns where arguments are technical identifiers
    const methodPatterns = [
        // URL/Query params
        /\.(get|set|has|delete|append)\s*\(\s*["'].*["']\s*\)/,
        // Object/Map/Set methods
        /\.(getItem|setItem|removeItem|hasOwnProperty|hasOwnProperty)\s*\(\s*["'].*["']\s*\)/,
        // Storage APIs
        /localStorage\.(get|set)/,
        /sessionStorage\.(get|set)/,
        // Headers
        /\.setRequestHeader\s*\(/,
        // Fetch/HTTP
        /\.method\s*=\s*["'](GET|POST|PUT|DELETE|PATCH)["']/
    ];

    // Check if line matches any of these patterns with the content
    const escapedContent = content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const contentPattern = new RegExp(`["']${escapedContent}["']`);

    if (methodPatterns.some(pattern => pattern.test(line)) && contentPattern.test(line)) {
        return true;
    }

    // Check for Object.keys, Object.values, Object.entries, etc.
    if (/Object\.(keys|values|entries|getOwnPropertyNames|getOwnPropertyDescriptor)/.test(line)) {
        return true;
    }

    // Check for common property access patterns that are technical
    if (/\.(get|set|has|delete)\s*\(/.test(line) && line.includes(content)) {
        // If it's a single lowercase word or camelCase, likely a property name
        if (/^[a-z][a-zA-Z0-9]*$/.test(content)) {
            return true;
        }
    }

    return false;
}

/**
 * Get files to scan based on configuration
 */
async function getFilesToScan(workspaceRoot: string, config: ScanConfig): Promise<string[]> {
    const fg = require('fast-glob');
    const defaultIgnore = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/.env',
        '**/.env.*',
        '**/env',
        '**/*.env'
    ];
    const allIgnorePatterns = config.ignore ? [...defaultIgnore, ...config.ignore] : defaultIgnore;

    const files = await fg(config.include, {
        cwd: workspaceRoot,
        absolute: true,
        ignore: allIgnorePatterns,
        onlyFiles: true
    });
    return files;
}

/**
 * Determine the context where the string appears
 */
function determineContext(line: string, content: string): string {
    if (line.includes('styled.') || line.includes('styled(')) {
        return 'styled-component';
    }

    if (line.match(/>\s*[^<]+\s*</)) {
        return 'jsx-text';
    }

    if (line.match(new RegExp(`\\w+\\s*=\\s*["'\`]${content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\`]`))) {
        return 'jsx-prop';
    }

    if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
        return 'variable';
    }

    if (line.includes('console.')) {
        return 'console';
    }

    return 'string-literal';
}

/**
 * Check if a string should be ignored based on patterns
 */
function shouldIgnoreString(content: string, ignorePatterns: string[], line: string): boolean {
    const trimmedContent = content.trim();

    // Ignore very short strings
    if (trimmedContent.length <= 2) {
        return true;
    }

    // Ignore ALL_CAPS strings (environment variables, constants)
    if (/^[A-Z_][A-Z0-9_]*$/.test(trimmedContent)) {
        return true;
    }

    // Ignore single lowercase words or camelCase identifiers (property names, variable names, etc.)
    // But allow sentence case or multi-word strings (those are likely user-facing)
    if (/^[a-z][a-z0-9]*$/.test(trimmedContent) && !trimmedContent.includes(' ')) {
        // Single lowercase word like "team", "user", "id", "name"
        return true;
    }
    if (/^[a-z][a-zA-Z0-9]*$/.test(trimmedContent) && /[A-Z]/.test(trimmedContent) && !/ /.test(trimmedContent)) {
        // camelCase like "userId", "firstName", "backgroundColor"
        return true;
    }

    // Ignore snake_case identifiers (storage keys, constants, etc.)
    if (/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(trimmedContent)) {
        // snake_case like "auth_token", "user_data", "session_id"
        return true;
    }

    // Ignore kebab-case identifiers (CSS classes, HTML ids, test ids, etc.)
    if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(trimmedContent)) {
        // kebab-case like "main-content", "btn-primary", "test-id"
        return true;
    }

    // Ignore version numbers (semver)
    if (/^\d+\.\d+\.\d+/.test(trimmedContent)) {
        // Like "1.0.0", "2.3.1"
        return true;
    }

    // Ignore CSS property strings (contain property: value format)
    if (/^[a-z-]+:\s*.+$/.test(trimmedContent) || /^(max|min)-(width|height):\s*\d+/.test(trimmedContent)) {
        // Like "max-width: 768px", "margin: 0 auto"
        return true;
    }

    // Ignore single capitalized words (proper names like "John", "Mary")
    // But allow multi-word strings
    if (/^[A-Z][a-z]+$/.test(trimmedContent) && !/ /.test(trimmedContent)) {
        // Single proper name like "John", "Sarah"
        return true;
    }

// Ignore date/time format strings (MM/DD/YYYY, HH:mm:ss, MMMM DD, YYYY etc.)
    if (/^[MDYHmsaAzZ/:,.\s-]+$/.test(trimmedContent)) {
        // Check for patterns: has slashes, colons, commas with spaces, or repeated format letters 2+ times
        if (
            /[\/:]/.test(trimmedContent) ||
            /(MM|DD|YY|HH|mm|ss)/.test(trimmedContent) ||
            /, /.test(trimmedContent)
        ) {
            return true;
        }
    }
    
    // Ignore email addresses
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedContent)) {
        return true;
    }
    
    // Ignore currency codes/symbols (USD, EUR, $, £, €, NZ$, AU$, etc.)
    if (/^[A-Z]{2,3}\$?$/i.test(trimmedContent) || /^[$£€¥₹₽₩]+$/.test(trimmedContent)) {
        return true;
    }

    // Ignore CSS grid template areas (repeated words)
    if (/^([a-z]+\s+)\1+[a-z]+$/.test(trimmedContent)) {
        // Like "header header header", "sidebar main main"
    }

    // Ignore CSS functions (repeat(), calc(), var(), etc.)
    if (/^(repeat|calc|var|url|rgb|rgba|hsl|hsla|linear-gradient|radial-gradient)\s*\(/.test(trimmedContent)) {
        return true;
    }

    // Ignore CSS shorthand values like "0 auto", "1fr 2fr", "10px 20px"
    if (/^[\d.]+\s+(auto|fr|[a-z]+)$/i.test(trimmedContent) || /^[\d.]+(px|rem|em|%)\s+[\d.]+(px|rem|em|%)$/i.test(trimmedContent)) {
        return true;
    }

    // Improve font family filter - check for font stacks with commas
    if (trimmedContent.includes(',')) {
        // Like "Arial, sans-serif", "Georgia, serif", "Helvetica, Arial, sans-serif"
        const fontGenericFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];
        if (fontGenericFamilies.some(family => trimmedContent.toLowerCase().includes(family))) {
            return true;
        }
    }

    // Ignore strings that look like regex patterns
    if (isRegexPattern(trimmedContent)) {
        return true;
    }

    // Ignore library/package names
    const libraryNames = ['react', 'React', 'ReactDOM', 'vue', 'Vue', 'angular', 'Angular'];
    if (libraryNames.includes(trimmedContent)) {
        return true;
    }

    // Ignore common technical strings
    const technicalStrings = [
        'px', 'rem', 'em', '%', 'vh', 'vw', 'pt', 'cm', 'mm', 'in',
        'flex', 'grid', 'block', 'inline', 'inline-block', 'none', 'auto', 'inherit', 'initial', 'unset',
        'absolute', 'relative', 'fixed', 'sticky', 'static',
        'hidden', 'visible', 'scroll', 'clip', 'overflow',
        'UTF-8', 'utf-8',
        'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD',
        'text/html', 'text/plain', 'application/json', 'application/xml', 'multipart/form-data',
        'cover', 'contain', 'fill', 'center', 'stretch',
        'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end',
        'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
        'bold', 'bolder', 'lighter', 'italic', 'oblique', 'normal',
        'left', 'right', 'top', 'bottom', 'middle', 'baseline',
        'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset',
        'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'space', 'round',
        'border-box', 'content-box', 'padding-box',
        'row', 'column', 'row-reverse', 'column-reverse',
        'wrap', 'nowrap', 'wrap-reverse',
        'start', 'end', 'flex-start', 'flex-end', 'space-between', 'space-around', 'space-evenly'
    ];

    if (technicalStrings.includes(trimmedContent)) {
        return true;
    }

    // Ignore CSS color values (hex, rgb, hsl, named colors)
    if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmedContent)) {
        return true;
    }

    // Ignore URLs and paths
    if (trimmedContent.match(/^(https?:\/\/|www\.|ftp:\/\/|file:\/\/|\/|\.\/|@import|url\()/)) {
        return true;
    }

    // Ignore file paths and extensions
    if (trimmedContent.match(/\.(jpg|jpeg|png|gif|svg|webp|bmp|ico|css|scss|sass|less|js|ts|tsx|jsx|json|xml|html|woff|woff2|ttf|eot|otf)$/i)) {
        return true;
    }

    // Ignore pure numbers or decimals
    if (/^\d+(\.\d+)?$/.test(trimmedContent)) {
        return true;
    }

    // Ignore CSS units and values
    if (/^\d+(px|rem|em|%|vh|vw|vmin|vmax|pt|cm|mm|in|pc|ex|ch|fr|s|ms|deg|rad|grad|turn)$/i.test(trimmedContent)) {
        return true;
    }

    // Ignore CSS multi-value properties (e.g., "0 auto", "10px 20px")
    if (/^\d+[a-z%]*\s+(\d+[a-z%]*|auto|inherit)(\s+\d+[a-z%]*)*$/i.test(trimmedContent)) {
        return true;
    }

    // Ignore font family names and stacks
    if (isFontFamily(trimmedContent)) {
        return true;
    }

    // Ignore grid/flex template syntax
    if (/^(repeat|minmax|auto|fr|span|fit-content)\(/.test(trimmedContent)) {
        return true;
    }

    // Ignore animation/transition timing
    if (/^\d+(\.\d+)?(s|ms)$/.test(trimmedContent)) {
        return true;
    }

    // Ignore transform functions
    if (/^(translate|translateX|translateY|translateZ|translate3d|rotate|rotateX|rotateY|rotateZ|rotate3d|scale|scaleX|scaleY|scaleZ|scale3d|skew|skewX|skewY|matrix|matrix3d|perspective)(\(|X|Y|Z|3d)/.test(trimmedContent)) {
        return true;
    }

    // Ignore CSS calc expressions
    if (/^calc\(/.test(trimmedContent)) {
        return true;
    }

    // Ignore single special characters and symbols
    if (/^[→←↑↓★•◦▪▫■□●○◆◇►▶▷▸▹►▻⌂⌘❯›»§¶†‡©®™℠@#$€£¥¢%&*]$/.test(trimmedContent)) {
        return true;
    }

    // Ignore CSS pseudo-selectors and animation names
    if (/^(hover|active|focus|visited|link|before|after|first-child|last-child|nth-child|fadeIn|fadeOut|slideIn|slideOut)$/i.test(trimmedContent)) {
        return true;
    }

    // Context-aware: Ignore if it's part of a CSS property assignment
    if (isCSSPropertyValue(line, content)) {
        return true;
    }

    // Check custom ignore patterns
    for (const pattern of ignorePatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(trimmedContent)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if a string looks like a regex pattern
 */
function isRegexPattern(content: string): boolean {
    // Count regex special characters
    const regexChars = /[\^$.*+?{}[\]()\\|]/g;
    const matches = content.match(regexChars);

    // If it has 3+ regex special characters, it's likely a regex
    if (matches && matches.length >= 3) {
        return true;
    }

    // Check for common regex patterns
    if (content.includes('\\d') || content.includes('\\w') || content.includes('\\s') ||
        content.includes('[0-9]') || content.includes('[a-z]') || content.includes('[A-Z]')) {
        return true;
    }

    return false;
}

/**
 * Check if string is inside a localization function call like t('key') or i18n.t('key')
 */
function isInsideLocalizationCall(line: string, content: string): boolean {
    // Escape special regex characters in content
    const escapedContent = content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Check for t('string'), t("string"), t(`string`)
    // Also check for i18n.t(), this.t(), etc.
    const patterns = [
        `\\bt\\s*\\(\\s*['"\`]${escapedContent}['"\`]`,
        `\\.t\\s*\\(\\s*['"\`]${escapedContent}['"\`]`,
        `i18n\\s*\\(\\s*['"\`]${escapedContent}['"\`]`,
        `translate\\s*\\(\\s*['"\`]${escapedContent}['"\`]`
    ];

    for (const pattern of patterns) {
        try {
            if (new RegExp(pattern).test(line)) {
                return true;
            }
        } catch {
            // Invalid regex, skip
            continue;
        }
    }

    return false;
}

/**
 * Check if a string is a font family name
 */
function isFontFamily(content: string): boolean {
    const commonFonts = [
        'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
        'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
        'Trebuchet MS', 'Arial Black', 'Impact', 'Roboto', 'Open Sans', 'Lato',
        'Montserrat', 'Raleway', 'Poppins', 'Source Sans Pro', 'system-ui'
    ];

    // Check if it matches a common font
    if (commonFonts.some(font => content.includes(font))) {
        return true;
    }

    // Check if it looks like a font stack (contains commas)
    if (content.includes(',')) {
        return true;
    }

    return false;
}

/**
 * Check if string is a CSS property value based on context
 */
function isCSSPropertyValue(line: string, content: string): boolean {
    // Check if the line looks like a CSS property assignment
    const cssPropertyPattern = /\w+:\s*["']?[^"']+["']?\s*[,;]/;
    if (cssPropertyPattern.test(line)) {
        // Check if this string is the value
        const propertyNames = [
            'backgroundColor', 'background-color', 'color', 'borderColor', 'border-color',
            'padding', 'margin', 'width', 'height', 'fontSize', 'font-size', 'fontFamily', 'font-family',
            'display', 'position', 'flexDirection', 'flex-direction', 'gridTemplate', 'grid-template',
            'transform', 'transition', 'animation', 'opacity', 'zIndex', 'z-index'
        ];

        for (const prop of propertyNames) {
            if (line.includes(`${prop}:`) && line.includes(content)) {
                return true;
            }
        }
    }

    return false;
}
