/**
 * scoped-css-core — framework-agnostic CSS scoping core.
 *
 * This package contains pure scoping logic, the CssAdapter interface, and
 * the createCssHooks factory. It has ZERO framework dependencies — it does
 * not import react or server-reactor.
 *
 * Adapter packages build on top of this core:
 *   - scoped-css-reactor  (server-reactor adapter)
 *   - scoped-css-react    (regular React adapter)
 *
 * For pre-bound hooks, import from the adapter package directly.
 * For custom adapters, implement CssAdapter and call createCssHooks().
 */

// Pure scoping logic + types (zero deps)
export {
  scopeCss,
  extractClassNames,
  nextScopeId,
  _resetScopeCounterForTests,
  type CSSMapping,
  type UseCSSOptions,
  type ScopeCssResult,
} from './scope.js'

// Adapter interface (type-only)
export type { CssAdapter } from './adapter.js'

// Hooks factory + types
export {
  createCssHooks,
  type CSSMappingProviderProps,
  type UseCSSResult,
  type UseCSSFileResult,
} from './core.js'
