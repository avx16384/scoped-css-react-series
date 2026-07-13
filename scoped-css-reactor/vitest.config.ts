import { defineConfig } from 'vitest/config'
import path from 'path'

// Alias server-reactor to its SOURCE (not dist) so that all imports — from the
// test files, from reactor-adapter.tsx, and from the JSX runtime — resolve to a
// single module instance. Without this, the `link:` symlink can cause vitest to
// load server-reactor as duplicate instances, each with its own module-level
// `currentContext` state, breaking the <provider>/useInjected mechanism.
// This mirrors the pattern used by server-reactor's own vitest.config.ts.
const SR_ROOT = path.resolve(__dirname, '../../server-reactor-series/server-reactor')

// Alias scoped-css-core to its SOURCE so the test shares the same module
// instance as the adapter (prevents scope-counter duplication from dual instances).
const CORE_ROOT = path.resolve(__dirname, '../scoped-css-core')

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'server-reactor',
  },
  resolve: {
    alias: {
      'server-reactor/jsx-runtime': path.resolve(SR_ROOT, 'src/jsx-runtime.ts'),
      'server-reactor/jsx-dev-runtime': path.resolve(SR_ROOT, 'src/jsx-dev-runtime.ts'),
      'server-reactor': path.resolve(SR_ROOT, 'src/index.ts'),
      '@gmono/scoped-css-core': path.resolve(CORE_ROOT, 'src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.{ts,tsx}'],
    testTimeout: 15000,
    hookTimeout: 15000,
  },
})
