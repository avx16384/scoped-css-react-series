/**
 * Pure logic tests for scope.ts — no framework dependencies.
 * Validates the core scoping algorithm shared by all adapters.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  scopeCss,
  extractClassNames,
  nextScopeId,
  _resetScopeCounterForTests,
} from '../src/scope.js'

describe('extractClassNames', () => {
  it('extracts simple class selectors', () => {
    expect(extractClassNames('.btn { color: red; }')).toEqual(['btn'])
  })

  it('extracts multiple unique class names', () => {
    const names = extractClassNames('.btn { } .card { } .btn { }')
    expect(names.sort()).toEqual(['btn', 'card'])
  })

  it('extracts hyphenated class names', () => {
    const names = extractClassNames('.btn-primary { } .btn-secondary { }')
    expect(names.sort()).toEqual(['btn-primary', 'btn-secondary'])
  })

  it('extracts classes from pseudo-selectors', () => {
    const names = extractClassNames('.link:hover { color: red; }')
    expect(names).toEqual(['link'])
  })

  it('extracts classes from nested selectors', () => {
    const names = extractClassNames('.card .title { font-weight: bold; }')
    expect(names.sort()).toEqual(['card', 'title'])
  })

  it('extracts classes from media queries', () => {
    const names = extractClassNames(
      '@media (max-width: 600px) { .responsive { width: 50%; } }',
    )
    expect(names).toEqual(['responsive'])
  })

  it('returns empty array for CSS without class selectors', () => {
    expect(extractClassNames('body { margin: 0; } #root { padding: 1rem; }')).toEqual([])
  })

  it('returns empty array for empty CSS', () => {
    expect(extractClassNames('')).toEqual([])
  })

  it('does not extract class names starting with a digit', () => {
    expect(extractClassNames('.1invalid { }')).toEqual([])
  })
})

describe('nextScopeId', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('generates sequential IDs starting from c1', () => {
    expect(nextScopeId()).toBe('c1')
    expect(nextScopeId()).toBe('c2')
    expect(nextScopeId()).toBe('c3')
  })

  it('generates unique IDs across multiple calls', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(nextScopeId())
    }
    expect(ids.size).toBe(100)
  })
})

describe('scopeCss', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('scopes simple class selectors with prefix', () => {
    const { scopedCss, classes } = scopeCss('.btn { padding: 0.5rem; }', 'c1')
    expect(scopedCss).toBe('.c1-btn { padding: 0.5rem; }')
    expect(classes).toEqual({ btn: 'c1-btn' })
  })

  it('scopes multiple class selectors', () => {
    const { scopedCss, classes } = scopeCss(
      '.btn { padding: 0.5rem; } .btn-primary { background: blue; }',
      'c3',
    )
    expect(scopedCss).toContain('.c3-btn {')
    expect(scopedCss).toContain('.c3-btn-primary {')
    expect(classes.btn).toBe('c3-btn')
    expect(classes['btn-primary']).toBe('c3-btn-primary')
  })

  it('preserves pseudo-selectors', () => {
    const { scopedCss, classes } = scopeCss(
      '.link { color: blue; } .link:hover { color: red; }',
      'c2',
    )
    expect(scopedCss).toContain('.c2-link {')
    expect(scopedCss).toContain('.c2-link:hover {')
    expect(classes.link).toBe('c2-link')
  })

  it('preserves nested selectors', () => {
    const { scopedCss, classes } = scopeCss(
      '.card { border: 1px; } .card .title { font-weight: bold; }',
      'c1',
    )
    expect(scopedCss).toContain('.c1-card {')
    expect(scopedCss).toContain('.c1-card .c1-title {')
    expect(classes.card).toBe('c1-card')
    expect(classes.title).toBe('c1-title')
  })

  it('preserves media queries', () => {
    const { scopedCss, classes } = scopeCss(
      '.responsive { width: 100%; } @media (max-width: 600px) { .responsive { width: 50%; } }',
      'c1',
    )
    expect(scopedCss).toContain('@media (max-width: 600px)')
    expect(scopedCss).toContain('.c1-responsive { width: 50%; }')
    expect(classes.responsive).toBe('c1-responsive')
  })

  it('handles empty CSS', () => {
    const { scopedCss, classes } = scopeCss('', 'c1')
    expect(scopedCss).toBe('')
    expect(classes).toEqual({})
  })

  it('does not partially replace shorter prefix of longer class', () => {
    // .btn-primary must not become .c1-btn-primary with the .btn rule
    // also matching inside it.
    const { scopedCss } = scopeCss(
      '.btn { color: red; } .btn-primary { background: blue; }',
      'c1',
    )
    // Should have exactly one occurrence of .c1-btn (not .c1-btn-primary matched by .btn)
    expect(scopedCss.match(/\.c1-btn(?![a-zA-Z0-9_-])/g)).not.toBeNull()
    expect(scopedCss).toContain('.c1-btn-primary')
    // Must NOT have a double-prefixed mess like .c1-c1-btn
    expect(scopedCss).not.toContain('c1-c1')
  })

  it('global mode returns identity mapping and unchanged CSS', () => {
    const { scopedCss, classes } = scopeCss(
      '.global-alert { color: red; } .global-info { color: blue; }',
      'c1',
      true,
    )
    expect(scopedCss).toBe('.global-alert { color: red; } .global-info { color: blue; }')
    expect(classes).toEqual({ 'global-alert': 'global-alert', 'global-info': 'global-info' })
  })

  it('global mode with empty prefix also returns identity', () => {
    const { scopedCss, classes } = scopeCss('.btn { color: red; }', '', false)
    expect(scopedCss).toBe('.btn { color: red; }')
    expect(classes).toEqual({ btn: 'btn' })
  })

  it('handles class names with underscores', () => {
    const { scopedCss, classes } = scopeCss('.my_class { color: red; }', 'c1')
    expect(scopedCss).toBe('.c1-my_class { color: red; }')
    expect(classes).toEqual({ my_class: 'c1-my_class' })
  })

  it('handles keyframe-style at-rules without breaking', () => {
    const { scopedCss, classes } = scopeCss(
      '.fade { animation: fade 0.3s; } @keyframes fade { from { opacity: 0; } to { opacity: 1; } }',
      'c1',
    )
    expect(classes.fade).toBe('c1-fade')
    expect(scopedCss).toContain('.c1-fade {')
    // @keyframes name should NOT be scoped (it's not a class selector)
    expect(scopedCss).toContain('@keyframes fade')
  })
})
