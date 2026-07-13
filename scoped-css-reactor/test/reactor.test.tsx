/**
 * Reactor adapter tests — comprehensive feature coverage for useCSS,
 * useCSSFile, CSSMappingProvider, and useCSSClasses under server-reactor
 * via the scoped-css-reactor package.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  createReactorCenter,
  executeWriterAsync,
} from 'server-reactor'
import { _resetScopeCounterForTests } from '@gmono/scoped-css-core'
import {
  useCSS,
  useCSSFile,
  CSSMappingProvider,
  useCSSClasses,
} from '../src/index.js'

// ── useCSS — basic scoping ─────────────────────────────────────────────

describe('reactor adapter: useCSS — basic scoping', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('scopes class names with unique prefix', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS(`
        .btn { padding: 0.5rem; }
        .btn-primary { background: blue; }
      `)
      captured = { classes, style }
      return <div class={classes.btn}>{style}Click</div>
    }
    const center = createReactorCenter('r-css-test1')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.classes.btn).toMatch(/^c\d+-btn$/)
    expect(captured.classes['btn-primary']).toMatch(/^c\d+-btn-primary$/)
    expect(result.html).toContain(captured.classes.btn)
    expect(result.html).toContain(`.${captured.classes.btn}`)
    expect(result.html).toContain(`.${captured.classes['btn-primary']}`)
  })

  it('scopeId matches the prefix used in classes', async () => {
    let captured: any
    function Comp() {
      const { classes, scopeId } = useCSS(`.btn { color: red; } .panel { border: 1px; }`)
      captured = { classes, scopeId }
      return <div class={classes.btn} />
    }
    const center = createReactorCenter('r-css-scopeid')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    await executeWriterAsync(w, {})

    expect(captured.scopeId).toMatch(/^c\d+$/)
    expect(captured.classes.btn).toBe(`${captured.scopeId}-btn`)
    expect(captured.classes.panel).toBe(`${captured.scopeId}-panel`)
  })

  it('different components get different scopes', async () => {
    let classes1: any, classes2: any

    function Comp1() {
      const { classes, style } = useCSS(`.box { color: red; }`)
      classes1 = classes
      return <div class={classes.box}>{style}A</div>
    }
    function Comp2() {
      const { classes, style } = useCSS(`.box { color: blue; }`)
      classes2 = classes
      return <div class={classes.box}>{style}B</div>
    }

    const c1 = createReactorCenter('r-css-scope1')
    c1.register(['request:http'], Comp1)
    const [w1] = await c1.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const r1 = await executeWriterAsync(w1, {})

    const c2 = createReactorCenter('r-css-scope2')
    c2.register(['request:http'], Comp2)
    const [w2] = await c2.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const r2 = await executeWriterAsync(w2, {})

    expect(classes1.box).not.toBe(classes2.box)
    expect(r1.html).toContain(classes1.box)
    expect(r2.html).toContain(classes2.box)
  })

  it('multiple useCSS calls in same component produce different scope IDs', async () => {
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
          <span class={a.classes.a}>A</span>
          <span class={b.classes.b}>B</span>
        </div>
      )
    }
    const center = createReactorCenter('r-css-multi')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(scope1).not.toBe(scope2)
    expect(scope1).toMatch(/^c\d+$/)
    expect(scope2).toMatch(/^c\d+$/)
    expect(result.html).toContain(`.${scope1}-a`)
    expect(result.html).toContain(`.${scope2}-b`)
  })
})

// ── useCSS — selector types ────────────────────────────────────────────

describe('reactor adapter: useCSS — selector types', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('handles pseudo-selectors like :hover', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS(`.link { color: blue; } .link:hover { color: red; }`)
      captured = classes
      return <a class={classes.link}>{style}Link</a>
    }
    const center = createReactorCenter('r-css-hover')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.link).toMatch(/^c\d+-link$/)
    expect(result.html).toContain(`.${captured.link}:hover`)
  })

  it('handles nested selectors (.parent .child)', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS(`.card { border: 1px; } .card .title { font-weight: bold; }`)
      captured = classes
      return <div class={classes.card}>{style}<span class={classes.title}>Hi</span></div>
    }
    const center = createReactorCenter('r-css-nested')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.card).toMatch(/^c\d+-card$/)
    expect(captured.title).toMatch(/^c\d+-title$/)
    expect(result.html).toContain(`.${captured.card} .${captured.title}`)
  })

  it('handles media queries', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS(`.responsive { width: 100%; } @media (max-width: 600px) { .responsive { width: 50%; } }`)
      captured = classes
      return <div class={classes.responsive}>{style}Content</div>
    }
    const center = createReactorCenter('r-css-media')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.responsive).toMatch(/^c\d+-responsive$/)
    expect(result.html).toContain(`.${captured.responsive}`)
    expect(result.html).toContain('@media')
  })

  it('handles keyframe at-rules without scoping @keyframes name', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS(
        `.fade { animation: fade 0.3s; } @keyframes fade { from { opacity: 0; } to { opacity: 1; } }`,
      )
      captured = classes
      return <div class={classes.fade}>{style}Fade</div>
    }
    const center = createReactorCenter('r-css-keyframes')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.fade).toMatch(/^c\d+-fade$/)
    // The class selector should be scoped
    expect(result.html).toContain(`.${captured.fade}`)
    // The @keyframes name should NOT be scoped
    expect(result.html).toContain('@keyframes fade')
    expect(result.html).not.toContain('@keyframes c')
  })

  it('handles class names with underscores', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS(`.my_class { color: red; }`)
      captured = classes
      return <div class={classes.my_class}>{style}Underscore</div>
    }
    const center = createReactorCenter('r-css-underscore')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.my_class).toMatch(/^c\d+-my_class$/)
    expect(result.html).toContain(`.${captured.my_class}`)
  })
})

// ── useCSS — options ───────────────────────────────────────────────────

describe('reactor adapter: useCSS — options', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('global mode keeps class names as-is', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS(`.global-alert { color: red; } .global-info { color: blue; }`, { global: true })
      captured = classes
      return <div>{style}<span class={classes['global-alert']}>Alert</span></div>
    }
    const center = createReactorCenter('r-css-global')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured['global-alert']).toBe('global-alert')
    expect(captured['global-info']).toBe('global-info')
    expect(result.html).toContain('class="global-alert"')
    expect(result.html).toContain('.global-alert')
  })

  it('scoped mode inherits parent scope prefix', async () => {
    let parentScopeId = ''
    let childScopeId = ''
    let childClasses: Record<string, string> = {}

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

    function Child() {
      const { classes, style, scopeId } = useCSS(`.label { font-size: 12px; }`, { scoped: true })
      childScopeId = scopeId
      childClasses = classes
      return <span class={classes.label}>{style}child</span>
    }

    const center = createReactorCenter('r-css-scoped-inherit')
    center.register(['request:http'], Parent)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(parentScopeId).toMatch(/^c\d+$/)
    expect(childScopeId).toBe(parentScopeId)
    expect(childClasses.label).toBe(`${childScopeId}-label`)
    expect(result.html).toContain(`.${childScopeId}-label`)
  })

  it('scoped mode without parent provider falls back to normal scoping', async () => {
    let captured: any
    function Comp() {
      const { classes, style, scopeId } = useCSS(`.btn { color: red; }`, { scoped: true })
      captured = { classes, style, scopeId }
      return <div class={classes.btn}>{style}Fallback</div>
    }
    const center = createReactorCenter('r-css-scoped-fallback')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    // Should still get a scope prefix (fallback to normal scoping)
    expect(captured.scopeId).toMatch(/^c\d+$/)
    expect(captured.classes.btn).toBe(`${captured.scopeId}-btn`)
    expect(result.html).toContain(`.${captured.scopeId}-btn`)
  })

  it('global + scoped combined: global takes precedence (CSS unchanged, scopeId inherited)', async () => {
    let parentScopeId = ''
    let childScopeId = ''
    let childClasses: Record<string, string> = {}

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

    function Child() {
      const { classes, style, scopeId } = useCSS(
        `.btn { color: green; }`,
        { global: true, scoped: true },
      )
      childScopeId = scopeId
      childClasses = classes
      return <span class={classes.btn}>{style}Child</span>
    }

    const center = createReactorCenter('r-css-global-scoped')
    center.register(['request:http'], Parent)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    // scopeId should be inherited from parent
    expect(childScopeId).toBe(parentScopeId)
    // But classes should be identity (global mode)
    expect(childClasses.btn).toBe('btn')
    // CSS should not be scoped — look for .btn { without a cN- prefix
    expect(result.html).toContain('.btn {')
    // Should NOT contain a scoped version
    expect(result.html).not.toMatch(/\.c\d+-btn \{[^}]*color: green/)
  })
})

// ── useCSS — edge cases ────────────────────────────────────────────────

describe('reactor adapter: useCSS — edge cases', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('returns empty classes for empty CSS', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSS('')
      captured = classes
      return <div>{style}Empty</div>
    }
    const center = createReactorCenter('r-css-empty')
    center.register(['request:http'], Comp)
    await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    expect(Object.keys(captured)).toHaveLength(0)
  })
})

// ── useCSSFile ─────────────────────────────────────────────────────────

describe('reactor adapter: useCSSFile', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('loads CSS from file and scopes it', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/scoped-css-reactor-test'
    const cssFile = path.join(tmpDir, 'test.css')
    await fs.mkdir(tmpDir, { recursive: true })
    await fs.writeFile(cssFile, '.panel { background: #fff; } .panel-header { font-size: 1.2rem; }')

    let captured: any
    function Comp() {
      const { classes, style } = useCSSFile(cssFile)
      captured = classes
      return <div class={classes.panel}>{style}<div class={classes['panel-header']}>Header</div></div>
    }
    const center = createReactorCenter('r-css-file-test')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.panel).toMatch(/^c\d+-panel$/)
    expect(captured['panel-header']).toMatch(/^c\d+-panel-header$/)
    expect(result.html).toContain(`.${captured.panel}`)
    expect(result.html).toContain(`.${captured['panel-header']}`)

    await fs.rm(tmpDir, { recursive: true })
  })

  it('handles missing file gracefully', async () => {
    let captured: any
    function Comp() {
      const { classes, style } = useCSSFile('/nonexistent/path/style.css')
      captured = classes
      return <div>{style}Content</div>
    }
    const center = createReactorCenter('r-css-file-missing')
    center.register(['request:http'], Comp)
    await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    expect(Object.keys(captured)).toHaveLength(0)
  })

  it('useCSSFile with global option keeps class names as-is', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/scoped-css-reactor-test'
    const cssFile = path.join(tmpDir, 'global.css')
    await fs.mkdir(tmpDir, { recursive: true })
    await fs.writeFile(cssFile, '.alert { color: red; } .info { color: blue; }')

    let captured: any
    function Comp() {
      const { classes, style } = useCSSFile(cssFile, { global: true })
      captured = classes
      return <div>{style}<span class={classes.alert}>Alert</span></div>
    }
    const center = createReactorCenter('r-css-file-global')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(captured.alert).toBe('alert')
    expect(captured.info).toBe('info')
    expect(result.html).toContain('class="alert"')
    expect(result.html).toContain('.alert')

    await fs.rm(tmpDir, { recursive: true })
  })

  it('useCSSFile with scoped option inherits parent scope prefix', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const tmpDir = '/tmp/scoped-css-reactor-test'
    const cssFile = path.join(tmpDir, 'child.css')
    await fs.mkdir(tmpDir, { recursive: true })
    await fs.writeFile(cssFile, '.label { font-size: 12px; }')

    let parentScopeId = ''
    let childScopeId = ''
    let childClasses: Record<string, string> = {}

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

    function Child() {
      const { classes, style, scopeId } = useCSSFile(cssFile, { scoped: true })
      childScopeId = scopeId
      childClasses = classes
      return <span class={classes.label}>{style}child</span>
    }

    const center = createReactorCenter('r-css-file-scoped')
    center.register(['request:http'], Parent)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    const result = await executeWriterAsync(w, {})

    expect(childScopeId).toBe(parentScopeId)
    expect(childClasses.label).toBe(`${childScopeId}-label`)
    expect(result.html).toContain(`.${childScopeId}-label`)

    await fs.rm(tmpDir, { recursive: true })
  })
})

// ── CSSMappingProvider + useCSSClasses ─────────────────────────────────

describe('reactor adapter: CSSMappingProvider + useCSSClasses', () => {
  beforeEach(() => {
    _resetScopeCounterForTests()
  })

  it('useCSSClasses returns parent mapping', async () => {
    let capturedClasses: Record<string, string> | undefined

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

    function Child() {
      capturedClasses = useCSSClasses()
      return <span>child</span>
    }

    const center = createReactorCenter('r-css-mapping-basic')
    center.register(['request:http'], Parent)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    await executeWriterAsync(w, {})

    expect(capturedClasses).toBeDefined()
    expect(capturedClasses!['btn']).toMatch(/^c\d+-btn$/)
    expect(capturedClasses!['panel']).toMatch(/^c\d+-panel$/)
  })

  it('useCSSClasses returns undefined outside provider', async () => {
    let captured: Record<string, string> | undefined

    function Comp() {
      captured = useCSSClasses()
      return <span>orphan</span>
    }

    const center = createReactorCenter('r-css-orphan')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    await executeWriterAsync(w, {})

    expect(captured).toBeUndefined()
  })

  it('nested providers: inner overrides outer', async () => {
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

    const center = createReactorCenter('r-css-nested-providers')
    center.register(['request:http'], Comp)
    const [w] = await center.dispatch({
      type: 'request:http', timestamp: Date.now(), source: 's',
      data: { method: 'GET', url: '/', path: '/', query: {}, headers: {}, params: {} },
    })
    await executeWriterAsync(w, {})

    // Inner provider should override outer
    expect(capturedClasses).toBeDefined()
    expect(capturedClasses!['btn']).toBe('c2-btn')
  })
})
