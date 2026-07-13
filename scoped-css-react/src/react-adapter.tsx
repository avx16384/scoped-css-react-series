/** @jsxImportSource react */
/**
 * scoped-css-react — regular React adapter.
 *
 * Implements CssAdapter<ReactNode> using React's hooks (useRef, useMemo,
 * useContext) and React Context for the mapping provider.
 *
 * This is the adapter for client-side React (Vite/CSR) and React SSR.
 *
 * NOTE: useCSSFile is intentionally unsupported here — browsers cannot
 * read files synchronously. Import CSS strings via your bundler's ?raw
 * suffix and pass to useCSS() instead.
 */

import {
  useRef,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import type { CssAdapter, CSSMapping } from '@gmono/scoped-css-core'

/**
 * React Context carrying the nearest CSSMapping.
 * Exported so custom providers can inject a mapping imperatively if needed.
 */
export const CssMappingContext = createContext<CSSMapping | undefined>(undefined)

export const ReactCssAdapter: CssAdapter<ReactNode> = {
  useRef: <T,>(initial: T) => useRef<T>(initial),
  useMemo: <T,>(factory: () => T, deps: any[]) => useMemo<T>(factory, deps),

  useMapping: () => useContext(CssMappingContext),

  provideMapping: (mapping, _id, children) => (
    <CssMappingContext.Provider value={mapping}>
      {children}
    </CssMappingContext.Provider>
  ),

  // Use dangerouslySetInnerHTML so CSS is emitted verbatim without React's
  // text-escaping — matches the server-reactor <style>{css}</style> behavior
  // and is the standard pattern for CSS-in-JS style tags.
  renderStyle: (css) => <style dangerouslySetInnerHTML={{ __html: css }} />,
}
