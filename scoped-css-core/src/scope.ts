/**
 * scoped-css-core — pure CSS scoping logic.
 *
 * Zero framework dependencies. This module is shared by all adapters
 * (server-reactor, React, and any future adapter) and contains only
 * pure functions + types.
 *
 * Extracted from server-reactor-stdlib/src/stdlib.tsx (lines 269–390).
 */

// ── Types ──────────────────────────────────────────────────────────────

/**
 * CSSMapping — the value provided by CSSMappingProvider.
 * Contains the scope ID and class name mapping from a parent useCSS() call.
 * Can also be manually constructed for custom mappings.
 */
export interface CSSMapping {
  /** The scope prefix (e.g. 'c3') */
  scopeId: string
  /** Class name mapping: original → scoped (e.g. { btn: 'c3-btn' }) */
  classes: Record<string, string>
}

export interface UseCSSOptions {
  /**
   * When true, CSS is emitted globally without scoping.
   * Class names are kept as-is (no prefix), and the `classes` map
   * returns the original names directly.
   * Useful for shared/global styles that should not be isolated.
   */
  global?: boolean
  /**
   * When true, CSS is scoped using the nearest parent CSSMappingProvider's scope prefix.
   * Like Vue's scoped CSS — child components share the parent's scope ID,
   * so class names are predictable and consistent across the subtree.
   * If no CSSMappingProvider is found, falls back to normal random scoping.
   */
  scoped?: boolean
}

export interface ScopeCssResult {
  /** The rewritten CSS with scoped class selectors (or original if global). */
  scopedCss: string
  /** Map: original class name → scoped class name (or identity if global). */
  classes: Record<string, string>
}

// ── Module-level scope counter ─────────────────────────────────────────

let _scopeCounter = 0

/**
 * Generate the next unique scope prefix (e.g. 'c1', 'c2', 'c3', ...).
 *
 * Monotonic within a single process. In SSR (server-reactor) this means
 * scopes are unique across requests in the same process. In CSR (React)
 * scopes are unique across the component tree for the page lifetime.
 */
export function nextScopeId(): string {
  return `c${++_scopeCounter}`
}

/**
 * Reset the scope counter. Intended for test isolation only.
 * Not exported from public entry points — only from the core index.
 */
export function _resetScopeCounterForTests(): void {
  _scopeCounter = 0
}

// ── Class name extraction ──────────────────────────────────────────────

const CLASS_NAME_REGEX = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g

/**
 * Extract all unique class names referenced in `.className` selectors
 * within the given CSS string.
 *
 * Handles:
 * - Simple selectors: `.btn { ... }`
 * - Pseudo-selectors: `.btn:hover`
 * - Nested selectors: `.parent .child`
 * - Media queries: `@media (...) { .responsive { ... } }`
 *
 * Does NOT extract class names from non-selector contexts (e.g. attribute
 * selectors `[class~="foo"]`).
 */
export function extractClassNames(css: string): string[] {
  const names = new Set<string>()
  let match: RegExpExecArray | null
  // Reset lastIndex — regex is module-level and stateful.
  CLASS_NAME_REGEX.lastIndex = 0
  while ((match = CLASS_NAME_REGEX.exec(css)) !== null) {
    names.add(match[1])
  }
  return [...names]
}

// ── CSS scoping ────────────────────────────────────────────────────────

/**
 * Scope a CSS string by prefixing all `.className` selectors with `prefix-`.
 *
 * - `global: true` (or prefix is empty) → returns CSS unchanged with
 *   identity class mapping (original name → original name).
 * - Otherwise → rewrites `.btn` → `.${prefix}-btn` using a word-boundary
 *   regex (longest names first to avoid partial replacement of
 *   `.btn-primary` when `.btn` is also present), and builds the class map.
 *
 * This is the pure core of the `useCSS` hook. Adapters call this inside
 * `useMemo` to get the scoped CSS + class mapping.
 *
 * @example
 * scopeCss('.btn { color: red; } .btn:hover { color: blue; }', 'c3')
 * // => {
 * //   scopedCss: '.c3-btn { color: red; } .c3-btn:hover { color: blue; }',
 * //   classes: { btn: 'c3-btn' }
 * // }
 *
 * @example
 * scopeCss('.global-alert { color: red; }', 'c3', true)
 * // => { scopedCss: '.global-alert { color: red; }', classes: { 'global-alert': 'global-alert' } }
 */
export function scopeCss(css: string, prefix: string, global: boolean = false): ScopeCssResult {
  // Global mode: no scoping, identity mapping.
  if (global || !prefix) {
    const classes: Record<string, string> = {}
    for (const name of extractClassNames(css)) {
      classes[name] = name
    }
    return { scopedCss: css, classes }
  }

  // Scoped mode: prefix all class selectors.
  const names = extractClassNames(css)
  const classes: Record<string, string> = {}
  for (const name of names) {
    classes[name] = `${prefix}-${name}`
  }

  // Replace longest names first to avoid partial-match replacement
  // (e.g. if both `.btn` and `.btn-primary` exist, replace `.btn-primary`
  // first so the `.btn` regex doesn't match its prefix).
  const sorted = [...names].sort((a, b) => b.length - a.length)
  let scopedCss = css
  for (const name of sorted) {
    // Negative lookahead: don't match if followed by another class-name char
    // (prevents `.btn` from matching inside `.btn-primary`).
    const re = new RegExp(`\\.${name}(?![a-zA-Z0-9_-])`, 'g')
    scopedCss = scopedCss.replace(re, `.${prefix}-${name}`)
  }

  return { scopedCss, classes }
}
