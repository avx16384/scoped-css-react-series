import { useCSS } from '@gmono/scoped-css-react'
import { ButtonShowcase } from './components/ButtonShowcase'
import { CardGrid } from './components/CardGrid'
import { ContactForm } from './components/ContactForm'
import { ThemeDemo } from './components/ThemeDemo'
import { ResponsiveLayout } from './components/ResponsiveLayout'

export function App() {
  const { classes, style } = useCSS(`
    .app-header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e0e0e0;
    }
    .app-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1a1a2e;
      margin-bottom: 0.5rem;
    }
    .app-subtitle {
      font-size: 1.1rem;
      color: #666;
    }
    .app-badge {
      display: inline-block;
      background: #6366f1;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-left: 0.5rem;
      vertical-align: middle;
    }
    .section {
      margin-bottom: 3rem;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #ddd;
    }
    .section-desc {
      color: #555;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
  `)

  return (
    <div>
      {style}
      <header className={classes['app-header']}>
        <h1 className={classes['app-title']}>
          scoped-css-react
          <span className={classes['app-badge']}>Playground</span>
        </h1>
        <p className={classes['app-subtitle']}>
          A regular React site testing the scoped CSS adapter — every component below uses useCSS()
          from the scoped-css-react package for fully isolated styles.
        </p>
      </header>

      <section className={classes['section']}>
        <h2 className={classes['section-title']}>Button Showcase</h2>
        <p className={classes['section-desc']}>
          Buttons with variants, sizes, and interactive states — all scoped via useCSS().
        </p>
        <ButtonShowcase />
      </section>

      <section className={classes['section']}>
        <h2 className={classes['section-title']}>Card Grid</h2>
        <p className={classes['section-desc']}>
          A responsive card grid where each card has its own independent CSS scope.
        </p>
        <CardGrid />
      </section>

      <section className={classes['section']}>
        <h2 className={classes['section-title']}>Contact Form</h2>
        <p className={classes['section-desc']}>
          A styled form with labelled inputs, textarea, and validation states.
        </p>
        <ContactForm />
      </section>

      <section className={classes['section']}>
        <h2 className={classes['section-title']}>Theme Demo (Scoped Inheritance)</h2>
        <p className={classes['section-desc']}>
          Parent defines a scope via CSSMappingProvider; children inherit it with{' '}
          <code>{'useCSS({ scoped: true })'}</code> and access parent classes via{' '}
          <code>{'useCSSClasses()'}</code>.
        </p>
        <ThemeDemo />
      </section>

      <section className={classes['section']}>
        <h2 className={classes['section-title']}>Responsive Layout</h2>
        <p className={classes['section-desc']}>
          A sidebar + content layout using media queries inside useCSS().
        </p>
        <ResponsiveLayout />
      </section>
    </div>
  )
}
