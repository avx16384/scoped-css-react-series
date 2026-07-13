/**
 * scoped-css-core — adapter interface (the "trait").
 *
 * Defines the contract between the framework-agnostic core hooks and a
 * specific rendering environment (server-reactor or React). Each adapter
 * implements these primitives using its framework's hooks, context, and JSX.
 *
 * The generic parameter `N` is the node type returned by JSX in that
 * environment (WriterNode for server-reactor, ReactNode for React).
 */

import type { CSSMapping } from './scope.js'

export interface CssAdapter<N = unknown> {
  /**
   * Persistent mutable ref across renders.
   * Mirrors React's useRef / server-reactor's useRef.
   */
  useRef<T>(initial: T): { current: T }

  /**
   * Memoize a value across renders, recomputing only when deps change.
   * Mirrors React's useMemo / server-reactor's useMemo.
   */
  useMemo<T>(factory: () => T, deps: any[]): T

  /**
   * Read the nearest CSSMapping from the context/provider tree.
   * Returns undefined if no CSSMappingProvider is found.
   * Mirrors server-reactor's useInjected({class:'css-mapping'}) /
   * React's useContext(CssMappingContext).
   */
  useMapping(): CSSMapping | undefined

  /**
   * Create a provider node that supplies a CSSMapping to its subtree.
   * The returned node is rendered in place of <CSSMappingProvider>.
   * Mirrors server-reactor's <provider> / React's Context.Provider.
   */
  provideMapping(mapping: CSSMapping, id: string | undefined, children: N): N

  /**
   * Render a <style> element containing the given CSS text.
   * The returned node is placed in the component tree to emit the styles.
   */
  renderStyle(css: string): N

  /**
   * Synchronously read a CSS file from disk. Used by useCSSFile.
   *
   * OPTIONAL — browser adapters (React CSR) do not implement this and
   * useCSSFile will throw a clear error directing users to import the
   * CSS string via their bundler's ?raw suffix instead.
   */
  readCssFileSync?(filePath: string): string
}
