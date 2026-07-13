import { useState } from 'react'
import { useCSS, CSSMappingProvider, useCSSClasses } from '@gmono/scoped-css-react'

/**
 * ThemeDemo — demonstrates scoped inheritance via CSSMappingProvider.
 *
 * The parent (ThemeDemo) calls useCSS() to get a scope, then wraps children
 * in <CSSMappingProvider> so child components can:
 *   1. Inherit the parent's scope prefix via useCSS({ scoped: true })
 *   2. Access the parent's class map via useCSSClasses()
 */

function ThemePanel() {
  // scoped: true → inherits parent's scopeId instead of generating a new one
  const { classes, style } = useCSS(
    `
    .panel {
      border-radius: 10px;
      padding: 1.25rem;
      margin-top: 0.75rem;
    }
    .panel-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .panel-text {
      font-size: 0.9rem;
      line-height: 1.5;
    }
    `,
    { scoped: true },
  )

  // Access the parent's class map to reference parent-defined classes
  const parentClasses = useCSSClasses()

  return (
    <div>
      {style}
      <div className={classes['panel']}>
        <h4 className={classes['panel-title']}>Child Panel (inherited scope)</h4>
        <p className={classes['panel-text']}>
          This panel uses <code>{'useCSS({ scoped: true })'}</code> — it shares the same scope
          prefix as the parent theme container.
        </p>
        {parentClasses && (
          <p className={classes['panel-text']}>
            Parent's theme button class:{' '}
            <code>{parentClasses['theme-toggle']}</code>
          </p>
        )}
      </div>
    </div>
  )
}

export function ThemeDemo() {
  const [dark, setDark] = useState(false)

  const { classes, style, scopeId } = useCSS(`
    .theme-container {
      border-radius: 12px;
      padding: 1.5rem;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .theme-light { background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; }
    .theme-dark { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }

    .theme-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .theme-title {
      font-size: 1.1rem;
      font-weight: 700;
    }
    .theme-toggle {
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease;
    }
    .theme-toggle-light { background: #1e293b; color: #f8fafc; }
    .theme-toggle-dark { background: #f8fafc; color: #1e293b; }

    .theme-scope-id {
      font-size: 0.75rem;
      opacity: 0.6;
      font-family: monospace;
    }
  `)

  return (
    <div>
      {style}
      <div
        className={`${classes['theme-container']} ${dark ? classes['theme-dark'] : classes['theme-light']}`}
      >
        <div className={classes['theme-header']}>
          <span className={classes['theme-title']}>
            {dark ? '🌙 Dark Theme' : '☀️ Light Theme'}
          </span>
          <button
            className={`${classes['theme-toggle']} ${dark ? classes['theme-toggle-dark'] : classes['theme-toggle-light']}`}
            onClick={() => setDark((d) => !d)}
          >
            Switch to {dark ? 'Light' : 'Dark'}
          </button>
        </div>
        <p className={classes['theme-scope-id']}>Parent scope ID: {scopeId}</p>

        {/* Wrap children in CSSMappingProvider so they can inherit this scope */}
        <CSSMappingProvider mapping={{ scopeId, classes }}>
          <ThemePanel />
        </CSSMappingProvider>
      </div>
    </div>
  )
}
