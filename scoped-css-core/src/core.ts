/**
 * scoped-css-core — core hooks factory.
 *
 * Framework-agnostic. Given a CssAdapter, returns bound hook functions
 * (useCSS, useCSSFile, CSSMappingProvider, useCSSClasses) that delegate
 * all environment-specific operations to the adapter.
 *
 * No JSX is used here — the adapter handles all node creation.
 */

import type { CssAdapter } from './adapter.js'
import { scopeCss, nextScopeId, type CSSMapping, type UseCSSOptions } from './scope.js'

// ── Types ──────────────────────────────────────────────────────────────

export interface UseCSSResult<N> {
  /** Scoped class name map: original → scoped (or original if global). */
  classes: Record<string, string>
  /** <style> element with scoped (or global) CSS — render once in your tree. */
  style: N
  /** The scope ID used for this CSS (e.g. 'c3'). Available for CSSMappingProvider. */
  scopeId: string
}

export interface UseCSSFileResult<N> {
  classes: Record<string, string>
  style: N
}

export interface CSSMappingProviderProps {
  /** A CSSMapping object — typically from a parent useCSS() return value. */
  mapping: CSSMapping
  /** Optional id for this provider. */
  id?: string
  /** Child components that consume the mapping. */
  children?: unknown
}

// ── Factory ────────────────────────────────────────────────────────────

/**
 * Create a set of CSS hooks bound to the given adapter.
 *
 * Each adapter package (scoped-css-reactor, scoped-css-react) calls this
 * factory once at module-eval time with its adapter and re-exports the
 * bound hooks.
 *
 * The generic `N` flows from the adapter's node type (WriterNode for
 * server-reactor, ReactNode for React), giving full type safety without
 * casts at call sites.
 */
export function createCssHooks<N>(adapter: CssAdapter<N>) {
  /**
   * Scope a CSS string to the current component instance.
   *
   * Parses all `.className` selectors in the CSS and rewrites them as
   * `.scopeId-className`, then returns a proxy object where
   * `classes.className` gives the scoped name.
   *
   * With `global: true`, no scoping is applied — class names stay as-is.
   *
   * Also returns a `style` node that renders a <style> tag.
   *
   * @example scoped
   * const { classes, style } = useCSS(`.btn { padding: 0.5rem; }`)
   * // classes = { btn: 'c3-btn' }
   * return <div>{style}<button class={classes.btn}>Click</button></div>
   *
   * @example global
   * const { classes, style } = useCSS(`.alert { color: red; }`, { global: true })
   * // classes = { alert: 'alert' }
   */
  function useCSS(css: string, opts?: UseCSSOptions): UseCSSResult<N> {
    const global = opts?.global ?? false
    const scoped = opts?.scoped ?? false

    // Scoped mode: inherit prefix from nearest CSSMappingProvider.
    const parentMapping = scoped ? adapter.useMapping() : undefined

    const scopeIdRef = adapter.useRef<string>('')
    if (!scopeIdRef.current) {
      if (scoped && parentMapping?.scopeId) {
        scopeIdRef.current = parentMapping.scopeId
      } else {
        scopeIdRef.current = nextScopeId()
      }
    }

    const { scopedCss, classes } = adapter.useMemo(
      () => scopeCss(css, scopeIdRef.current, global),
      [css, scopeIdRef.current, global],
    )

    const style = adapter.renderStyle(scopedCss)
    return { classes, style, scopeId: scopeIdRef.current }
  }

  /**
   * Load CSS from a file and scope it to the current component instance.
   *
   * Same as useCSS() but reads the CSS string from a file path.
   * The file is read synchronously at render time and cached via useMemo.
   *
   * NOTE: Only available in environments where the adapter implements
   * readCssFileSync (server-reactor/Node). In browser React, import the
   * CSS string via your bundler's ?raw suffix and pass to useCSS().
   *
   * @example
   * const { classes, style } = useCSSFile('./styles/button.css')
   * return <div>{style}<button class={classes.btn}>Click</button></div>
   */
  function useCSSFile(filePath: string, opts?: UseCSSOptions): UseCSSFileResult<N> {
    if (!adapter.readCssFileSync) {
      throw new Error(
        'useCSSFile is not supported in this environment — the active CssAdapter does not ' +
          'implement readCssFileSync. In a browser React app, import the CSS as a string ' +
          'via your bundler ?raw suffix (e.g. import css from "./btn.css?raw") and ' +
          'pass it to useCSS() instead.',
      )
    }
    const readCss = adapter.readCssFileSync
    const css = adapter.useMemo(() => {
      try {
        return readCss(filePath)
      } catch {
        return ''
      }
    }, [filePath])
    return useCSS(css, opts)
  }

  /**
   * Provide a CSS class mapping to the subtree via the Provider mechanism.
   *
   * Child components using `useCSS({ scoped: true })` will inherit this
   * scope prefix, and `useCSSClasses()` will return this mapping.
   *
   * @example
   * const { classes, style, scopeId } = useCSS(`.btn { ... }`)
   * return (
   *   <div>
   *     {style}
   *     <CSSMappingProvider mapping={{ scopeId, classes }}>
   *       <ChildComponent />
   *     </CSSMappingProvider>
   *   </div>
   * )
   */
  function CSSMappingProvider(props: CSSMappingProviderProps): N {
    return adapter.provideMapping(props.mapping, props.id, props.children as N)
  }

  /**
   * Look up the nearest CSSMappingProvider's class mapping.
   * Returns the parent's `classes` object so child components can reference
   * parent-defined scoped class names.
   *
   * Returns undefined if no CSSMappingProvider is found in the ancestor tree.
   *
   * @example
   * const parentClasses = useCSSClasses()
   * return <div class={parentClasses?.panel || 'panel'}>...</div>
   */
  function useCSSClasses(): Record<string, string> | undefined {
    return adapter.useMapping()?.classes
  }

  return { useCSS, useCSSFile, CSSMappingProvider, useCSSClasses }
}
