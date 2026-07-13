import { defineConfig } from 'vitest/config'
import path from 'path'

// Alias scoped-css-core to its SOURCE so the test shares the same module
// instance as the adapter (prevents scope-counter duplication from dual instances
// that can arise from `link:` symlinks across workspace boundaries).
const CORE_ROOT = path.resolve(__dirname, '../scoped-css-core')

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    alias: {
      '@gmono/scoped-css-core': path.resolve(CORE_ROOT, 'src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    testTimeout: 15000,
    hookTimeout: 15000,
  },
})
