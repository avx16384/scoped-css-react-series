/**
 * scoped-css-reactor — server-reactor adapter.
 *
 * Implements CssAdapter<WriterNode> using server-reactor's hooks
 * (useRef, useMemo, useInjected) and intrinsic JSX elements (<provider>, <style>).
 *
 * This is the adapter for SSR via server-reactor.
 */

import { useRef, useMemo, useInjected, type WriterNode } from 'server-reactor'
import { readFileSync } from 'node:fs'
import type { CssAdapter, CSSMapping } from '@gmono/scoped-css-core'

export const ReactorCssAdapter: CssAdapter<WriterNode> = {
  useRef: <T,>(initial: T) => useRef<T>(initial),
  useMemo: <T,>(factory: () => T, deps: any[]) => useMemo<T>(factory, deps),

  useMapping: () => {
    const result = useInjected({ class: 'css-mapping' })
    // useInjected returns an array when multiple providers match (nested providers).
    // The innermost provider (last in the array) takes precedence.
    if (Array.isArray(result)) {
      return result.length > 0
        ? (result[result.length - 1] as CSSMapping)
        : undefined
    }
    return result as CSSMapping | undefined
  },

  provideMapping: (mapping, id, children) => (
    <provider id={id || ''} class="css-mapping" value={mapping}>
      {children}
    </provider>
  ),

  renderStyle: (css) => <style>{css}</style>,

  readCssFileSync: (filePath) => readFileSync(filePath, 'utf-8'),
}
