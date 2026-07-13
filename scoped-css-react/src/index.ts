/**
 * scoped-css-react — regular React entry point.
 *
 * Pre-bound CSS hooks for regular React (CSR/SSR).
 * All hooks are bound to ReactCssAdapter at module-eval time.
 *
 * useCSSFile is NOT exported — browsers cannot read files synchronously.
 * Import CSS strings via your bundler's ?raw suffix and pass to useCSS().
 */

import { createCssHooks } from '@gmono/scoped-css-core'
import { ReactCssAdapter, CssMappingContext } from './react-adapter.js'
import type { ReactNode } from 'react'

const hooks = createCssHooks<ReactNode>(ReactCssAdapter)

export const useCSS = hooks.useCSS
export const CSSMappingProvider = hooks.CSSMappingProvider
export const useCSSClasses = hooks.useCSSClasses

// Re-export the context for advanced use (e.g. testing, custom providers).
export { CssMappingContext }

export type { CSSMapping, UseCSSOptions } from '@gmono/scoped-css-core'
export type { CSSMappingProviderProps, UseCSSResult } from '@gmono/scoped-css-core'
