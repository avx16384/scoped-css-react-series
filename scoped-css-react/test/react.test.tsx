/** @jsxImportSource react */
// @vitest-environment jsdom

/**
 * React adapter tests — comprehensive feature coverage for useCSS,
 * CSSMappingProvider, useCSSClasses, and CssMappingContext under
 * regular React (browser/CSR) via @testing-library/react.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { _resetScopeCounterForTests } from '@gmono/scoped-css-core'
import {
  useCSS,
  CSSMappingProvider,
  useCSSClasses,
  CssMappingContext,
} from '../src/index.js'

// ── useCSS — basic scoping ─────────────────────────────────────────────

describe('react adapter: useCSS — basic scoping', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
    document.body.innerHTML = ''
  })

  it('scopes class names with unique prefix', () => {
    let captured: { classes: Record<string, string>; style: React.ReactNode } | undefined
    function Comp() {
      const { classes, style } = useCSS(`
        .btn { padding: 0.5rem; }
        .btn-primary { background: blue; }
      `)
      captured = { classes, style }
      return (
        <div className={classes.btn}>
          {style}
          <span>Click</span>
        </div>
      )
    }
    const { container } = render(<Comp />)

    expect(captured!.classes.btn).toMatch(/^c\d+-btn$/)
    expect(captured!.classes['btn-primary']).toMatch(/^c\d+-btn-primary$/)

    const div = container.querySelector('div')
    expect(div?.className).toContain(captured!.classes.btn)

    const styleEl = container.querySelector('style')
    expect(styleEl).not.toBeNull()
    expect(styleEl!.textContent).toContain(`.${captured!.classes.btn}`)
    expect(styleEl!.textContent).toContain(`.${captured!.classes['btn-primary']}`)
  })

  it('scopeId matches the prefix used in classes', () => {
    let captured: { classes: Record<string, string>; scopeId: string } | undefined
    function Comp() {
      const { classes, scopeId } = useCSS(`.btn { color: red; } .panel { border: 1px; }`)
      captured = { classes, scopeId }
      return <div className={classes.btn} />
    }
    render(<Comp />)

    expect(captured!.scopeId).toMatch(/^c\d+$/)
    expect(captured!.classes.btn).toBe(`${captured!.scopeId}-btn`)
    expect(captured!.classes.panel).toBe(`${captured!.scopeId}-panel`)
  })

  it('different components get different scopes', () => {
    let classes1: Record<string, string> | undefined
    let classes2: Record<string, string> | undefined

    function Comp1() {
      const { classes, style } = useCSS(`.box { color: red; }`)
      classes1 = classes
      return <div className={classes.box}>{style}A</div>
    }
    function Comp2() {
      const { classes, style } = useCSS(`.box { color: blue; }`)
      classes2 = classes
      return <div className={classes.box}>{style}B</div>
    }

    const { container: c1 } = render(<Comp1 />)
    const { container: c2 } = render(<Comp2 />)

    expect(classes1!.box).not.toBe(classes2!.box)
    expect(c1.querySelector('div')?.className).toContain(classes1!.box)
    expect(c2.querySelector('div')?.className).toContain(classes2!.box)
  })

  it('multiple useCSS calls in same component produce different scope IDs', () => {
    let scope1 = ''
    let scope2 = ''
    function Comp() {
      const a = useCSS(`.a { color: red; }`)
      const b = useCSS(`.b { color: blue; }`)
      scope1 = a.scopeId
      scope2 = b.scopeId
      return (
        <div>
          {a.style}
          {b.style}
          <span className={a.classes.a}>A</span>
          <span className={b.classes.b}>B</span>
        </div>
      )
    }
    const { container } = render(<Comp />)

    expect(scope1).not.toBe(scope2)
    expect(scope1).toMatch(/^c\d+$/)
    expect(scope2).toMatch(/^c\d+$/)
    // Each style tag should contain its own scoped selector
    const styleEls = container.querySelectorAll('style')
    expect(styleEls.length).toBe(2)
    expect(styleEls[0].textContent).toContain(`.${scope1}-a`)
    expect(styleEls[1].textContent).toContain(`.${scope2}-b`)
  })
})

// ── useCSS — selector types ────────────────────────────────────────────

describe('react adapter: useCSS — selector types', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
    document.body.innerHTML = ''
  })

  it('handles pseudo-selectors like :hover', () => {
    let captured: Record<string, string> | undefined
    function Comp() {
      const { classes, style } = useCSS(`.link { color: blue; } .link:hover { color: red; }`)
      captured = classes
      return <a className={classes.link}>{style}Link</a>
    }
    const { container } = render(<Comp />)

    expect(captured!.link).toMatch(/^c\d+-link$/)
    const styleEl = container.querySelector('style')
    expect(styleEl!.textContent).toContain(`.${captured!.link}:hover`)
  })

  it('handles nested selectors (.parent .child)', () => {
    let captured: Record<string, string> | undefined
    function Comp() {
      const { classes, style } = useCSS(`.card { border: 1px; } .card .title { font-weight: bold; }`)
      captured = classes
      return (
        <div className={classes.card}>
          {style}
          <span className={classes.title}>Hi</span>
        </div>
      )
    }
    const { container } = render(<Comp />)

    expect(captured!.card).toMatch(/^c\d+-card$/)
    expect(captured!.title).toMatch(/^c\d+-title$/)
    const styleEl = container.querySelector('style')
    expect(styleEl!.textContent).toContain(`.${captured!.card} .${captured!.title}`)
  })

  it('handles media queries', () => {
    let captured: Record<string, string> | undefined
    function Comp() {
      const { classes, style } = useCSS(
        `.responsive { width: 100%; } @media (max-width: 600px) { .responsive { width: 50%; } }`,
      )
      captured = classes
      return <div className={classes.responsive}>{style}Content</div>
    }
    const { container } = render(<Comp />)

    expect(captured!.responsive).toMatch(/^c\d+-responsive$/)
    const styleEl = container.querySelector('style')
    expect(styleEl!.textContent).toContain('@media')
    expect(styleEl!.textContent).toContain(`.${captured!.responsive}`)
  })

  it('handles keyframe at-rules without scoping @keyframes name', () => {
    let captured: Record<string, string> | undefined
    function Comp() {
      const { classes, style } = useCSS(
        `.fade { animation: fade 0.3s; } @keyframes fade { from { opacity: 0; } to { opacity: 1; } }`,
      )
      captured = classes
      return <div className={classes.fade}>{style}Fade</div>
    }
    const { container } = render(<Comp />)

    expect(captured!.fade).toMatch(/^c\d+-fade$/)
    const styleEl = container.querySelector('style')
    // The class selector should be scoped
    expect(styleEl!.textContent).toContain(`.${captured!.fade}`)
    // The @keyframes name should NOT be scoped (it's not a class)
    expect(styleEl!.textContent).toContain('@keyframes fade')
    expect(styleEl!.textContent).not.toContain('@keyframes c')
  })

  it('handles class names with underscores', () => {
    let captured: Record<string, string> | undefined
    function Comp() {
      const { classes, style } = useCSS(`.my_class { color: red; }`)
      captured = classes
      return <div className={classes.my_class}>{style}Underscore</div>
    }
    const { container } = render(<Comp />)

    expect(captured!.my_class).toMatch(/^c\d+-my_class$/)
    const styleEl = container.querySelector('style')
    expect(styleEl!.textContent).toContain(`.${captured!.my_class}`)
  })
})

// ── useCSS — options ───────────────────────────────────────────────────

describe('react adapter: useCSS — options', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
    document.body.innerHTML = ''
  })

  it('global mode keeps class names as-is', () => {
    let captured: Record<string, string> | undefined
    function Comp() {
      const { classes, style } = useCSS(
        `.global-alert { color: red; } .global-info { color: blue; }`,
        { global: true },
      )
      captured = classes
      return (
        <div>
          {style}
          <span className={classes['global-alert']}>Alert</span>
        </div>
      )
    }
    const { container } = render(<Comp />)

    expect(captured!['global-alert']).toBe('global-alert')
    expect(captured!['global-info']).toBe('global-info')

    const span = container.querySelector('span')
    expect(span?.className).toBe('global-alert')

    const styleEl = container.querySelector('style')
    expect(styleEl!.textContent).toContain('.global-alert')
    expect(styleEl!.textContent).toContain('.global-info')
    expect(styleEl!.textContent).not.toMatch(/c\d+-global/)
  })

  it('scoped mode inherits parent scope prefix', () => {
    let childScopeId = ''
    let childClasses: Record<string, string> = {}
    let capturedParentScopeId = ''

    function Child() {
      const { classes, style, scopeId } = useCSS(`.label { font-size: 12px; }`, { scoped: true })
      childScopeId = scopeId
      childClasses = classes
      return <span className={classes.label}>{style}child</span>
    }

    function Parent() {
      const { classes, style, scopeId } = useCSS(`.btn { color: blue; }`)
      capturedParentScopeId = scopeId
      return (
        <div>
          {style}
          <CSSMappingProvider mapping={{ scopeId, classes }}>
            <Child />
          </CSSMappingProvider>
        </div>
      )
    }

    const { container } = render(<Parent />)

    expect(childScopeId).toMatch(/^c\d+$/)
    expect(childClasses.label).toBe(`${childScopeId}-label`)

    const styleEls = container.querySelectorAll('style')
    const allCss = [...styleEls].map((el) => el.textContent || '').join('\n')
    expect(allCss).toContain(`.${childScopeId}-label`)
    expect(childScopeId).toBe(capturedParentScopeId)
  })

  it('scoped mode without parent provider falls back to normal scoping', () => {
    let captured: { classes: Record<string, string>; style: React.ReactNode; scopeId: string } | undefined
    function Comp() {
      const { classes, style, scopeId } = useCSS(`.btn { color: red; }`, { scoped: true })
      captured = { classes, style, scopeId }
      return <div className={classes.btn}>{style}Fallback</div>
    }
    const { container } = render(<Comp />)

    // Should still get a scope prefix (fallback to normal scoping)
    expect(captured!.scopeId).toMatch(/^c\d+$/)
    expect(captured!.classes.btn).toBe(`${captured!.scopeId}-btn`)
    const styleEl = container.querySelector('style')
    expect(styleEl!.textContent).toContain(`.${captured!.scopeId}-btn`)
  })

  it('global + scoped combined: global takes precedence (CSS unchanged, scopeId inherited)', () => {
    let parentScopeId = ''
    let childScopeId = ''
    let childClasses: Record<string, string> = {}

    function Child() {
      // Both global and scoped: CSS should be global (no prefix),
      // but scopeId should be inherited from parent.
      const { classes, style, scopeId } = useCSS(
        `.btn { color: green; }`,
        { global: true, scoped: true },
      )
      childScopeId = scopeId
      childClasses = classes
      return <span className={classes.btn}>{style}Child</span>
    }

    function Parent() {
      const { classes, style, scopeId } = useCSS(`.btn { color: blue; }`)
      parentScopeId = scopeId
      return (
        <div>
          {style}
          <CSSMappingProvider mapping={{ scopeId, classes }}>
            <Child />
          </CSSMappingProvider>
        </div>
      )
    }

    const { container } = render(<Parent />)

    // scopeId should be inherited from parent
    expect(childScopeId).toBe(parentScopeId)
    // But classes should be identity (global mode)
    expect(childClasses.btn).toBe('btn')
    // CSS should not be scoped
    const styleEls = container.querySelectorAll('style')
    const childStyleEl = [...styleEls].find(
      (el) => el.textContent?.includes('color: green'),
    )
    expect(childStyleEl).toBeDefined()
    expect(childStyleEl!.textContent).toContain('.btn {')
    expect(childStyleEl!.textContent).not.toMatch(/c\d+-btn/)
  })
})

// ── useCSS — edge cases ────────────────────────────────────────────────

describe('react adapter: useCSS — edge cases', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
    document.body.innerHTML = ''
  })

  it('returns empty classes for empty CSS', () => {
    let captured: Record<string, string> | undefined
    function Comp() {
      const { classes, style } = useCSS('')
      captured = classes
      return <div>{style}Empty</div>
    }
    render(<Comp />)
    expect(Object.keys(captured!)).toHaveLength(0)
  })
})

// ── useCSSFile ─────────────────────────────────────────────────────────

describe('react adapter: useCSSFile', () => {
  it('useCSSFile is not exported (browser adapter has no readCssFileSync)', async () => {
    const mod = await import('../src/index.js')
    expect((mod as any).useCSSFile).toBeUndefined()
  })
})

// ── CSSMappingProvider + useCSSClasses ─────────────────────────────────

describe('react adapter: CSSMappingProvider + useCSSClasses', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
    document.body.innerHTML = ''
  })

  it('useCSSClasses returns parent mapping', () => {
    let capturedClasses: Record<string, string> | undefined

    function Child() {
      capturedClasses = useCSSClasses()
      return <span>child</span>
    }

    function Parent() {
      const { classes, style, scopeId } = useCSS(`.btn { color: blue; } .panel { border: 1px; }`)
      return (
        <div>
          {style}
          <CSSMappingProvider mapping={{ scopeId, classes }}>
            <Child />
          </CSSMappingProvider>
        </div>
      )
    }

    render(<Parent />)

    expect(capturedClasses).toBeDefined()
    expect(capturedClasses!['btn']).toMatch(/^c\d+-btn$/)
    expect(capturedClasses!['panel']).toMatch(/^c\d+-panel$/)
  })

  it('useCSSClasses returns undefined outside provider', () => {
    let captured: Record<string, string> | undefined
    function Orphan() {
      captured = useCSSClasses()
      return <span>orphan</span>
    }
    render(<Orphan />)
    expect(captured).toBeUndefined()
  })

  it('nested providers: inner overrides outer', () => {
    let capturedClasses: Record<string, string> | undefined

    function InnerChild() {
      capturedClasses = useCSSClasses()
      return <span>inner</span>
    }

    function Comp() {
      return (
        <CSSMappingProvider mapping={{ scopeId: 'c1', classes: { btn: 'c1-btn' } }}>
          <div>
            <CSSMappingProvider mapping={{ scopeId: 'c2', classes: { btn: 'c2-btn' } }}>
              <InnerChild />
            </CSSMappingProvider>
          </div>
        </CSSMappingProvider>
      )
    }

    render(<Comp />)

    // Inner provider should override outer
    expect(capturedClasses).toBeDefined()
    expect(capturedClasses!['btn']).toBe('c2-btn')
  })

  it('provider with id prop works correctly', () => {
    let capturedClasses: Record<string, string> | undefined

    function Child() {
      capturedClasses = useCSSClasses()
      return <span>child</span>
    }

    function Comp() {
      const { classes, style, scopeId } = useCSS(`.btn { color: blue; }`)
      return (
        <div>
          {style}
          <CSSMappingProvider mapping={{ scopeId, classes }} id="my-provider">
            <Child />
          </CSSMappingProvider>
        </div>
      )
    }

    render(<Comp />)

    expect(capturedClasses).toBeDefined()
    expect(capturedClasses!['btn']).toMatch(/^c\d+-btn$/)
  })
})

// ── CssMappingContext ──────────────────────────────────────────────────

describe('react adapter: CssMappingContext', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
    document.body.innerHTML = ''
  })

  it('CssMappingContext is exported', () => {
    expect(CssMappingContext).toBeDefined()
    expect(CssMappingContext.Provider).toBeDefined()
    expect(CssMappingContext.Consumer).toBeDefined()
  })

  it('custom provider via CssMappingContext.Provider works', () => {
    let capturedClasses: Record<string, string> | undefined

    function Child() {
      capturedClasses = useCSSClasses()
      return <span>child</span>
    }

    function Comp() {
      return (
        <CssMappingContext.Provider value={{ scopeId: 'c99', classes: { btn: 'c99-btn' } }}>
          <Child />
        </CssMappingContext.Provider>
      )
    }

    render(<Comp />)

    expect(capturedClasses).toBeDefined()
    expect(capturedClasses!['btn']).toBe('c99-btn')
  })
})

// ── Style tag rendering ────────────────────────────────────────────────

describe('react adapter: style tag rendering', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
    document.body.innerHTML = ''
  })

  it('renders CSS content verbatim (no HTML escaping)', () => {
    function Comp() {
      const { classes, style } = useCSS(`.btn { content: "a < b & c > d"; }`)
      return <div className={classes.btn}>{style}Btn</div>
    }
    const { container } = render(<Comp />)
    const styleEl = container.querySelector('style')
    expect(styleEl!.textContent).toContain('a < b & c > d')
  })

  it('renders multiple style tags for multiple useCSS calls', () => {
    function Comp() {
      const a = useCSS(`.a { color: red; }`)
      const b = useCSS(`.b { color: blue; }`)
      return (
        <div>
          {a.style}
          {b.style}
          <span className={a.classes.a}>A</span>
          <span className={b.classes.b}>B</span>
        </div>
      )
    }
    const { container } = render(<Comp />)
    const styleEls = container.querySelectorAll('style')
    expect(styleEls.length).toBe(2)
  })

  it('style tag contains exactly the scoped CSS', () => {
    let captured: { classes: Record<string, string>; scopeId: string } | undefined
    function Comp() {
      const { classes, style, scopeId } = useCSS(`.btn { padding: 0.5rem; }`)
      captured = { classes, scopeId }
      return <div className={classes.btn}>{style}Btn</div>
    }
    const { container } = render(<Comp />)
    const styleEl = container.querySelector('style')
    // The style tag should contain the scoped selector with the exact scopeId
    expect(styleEl!.textContent).toContain(`.${captured!.scopeId}-btn { padding: 0.5rem; }`)
  })
})
