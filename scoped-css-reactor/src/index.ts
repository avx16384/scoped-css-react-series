/**
 * scoped-css-reactor — server-reactor entry point.
 *
 * Pre-bound CSS hooks for server-reactor (SSR).
 * All hooks are bound to ReactorCssAdapter at module-eval time.
 */

import { createCssHooks } from '@gmono/scoped-css-core'
import { ReactorCssAdapter } from './reactor-adapter.js'
import type { WriterNode } from 'server-reactor'

const hooks = createCssHooks<WriterNode>(ReactorCssAdapter)

export const useCSS = hooks.useCSS
export const useCSSFile = hooks.useCSSFile
export const CSSMappingProvider = hooks.CSSMappingProvider
export const useCSSClasses = hooks.useCSSClasses

export type { CSSMapping, UseCSSOptions } from '@gmono/scoped-css-core'
export type {
  CSSMappingProviderProps,
  UseCSSResult,
  UseCSSFileResult,
} from '@gmono/scoped-css-core'
