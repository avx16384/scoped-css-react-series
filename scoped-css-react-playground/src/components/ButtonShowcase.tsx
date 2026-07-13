import { useState } from 'react'
import { useCSS } from '@gmono/scoped-css-react'

export function ButtonShowcase() {
  const { classes, style } = useCSS(`
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
      line-height: 1;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn:focus-visible {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
    }

    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    .btn-md { padding: 0.6rem 1.2rem; font-size: 0.95rem; }
    .btn-lg { padding: 0.85rem 1.75rem; font-size: 1.1rem; }

    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }

    .btn-secondary { background: #e0e7ff; color: #4338ca; }
    .btn-secondary:hover:not(:disabled) { background: #c7d2fe; }

    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }

    .btn-ghost {
      background: transparent;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .btn-ghost:hover:not(:disabled) { background: #f1f5f9; border-color: #94a3b8; }

    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: 80px;
    }
  `)

  const [clickCount, setClickCount] = useState(0)

  return (
    <div>
      {style}
      <div className={classes['row']}>
        <span className={classes['label']}>Primary</span>
        <button className={`${classes['btn']} ${classes['btn-sm']} ${classes['btn-primary']}`} onClick={() => setClickCount((c) => c + 1)}>
          Small
        </button>
        <button className={`${classes['btn']} ${classes['btn-md']} ${classes['btn-primary']}`} onClick={() => setClickCount((c) => c + 1)}>
          Medium (clicked {clickCount}×)
        </button>
        <button className={`${classes['btn']} ${classes['btn-lg']} ${classes['btn-primary']}`} onClick={() => setClickCount((c) => c + 1)}>
          Large
        </button>
        <button className={`${classes['btn']} ${classes['btn-md']} ${classes['btn-primary']}`} disabled>
          Disabled
        </button>
      </div>

      <div className={classes['row']}>
        <span className={classes['label']}>Secondary</span>
        <button className={`${classes['btn']} ${classes['btn-sm']} ${classes['btn-secondary']}`}>Small</button>
        <button className={`${classes['btn']} ${classes['btn-md']} ${classes['btn-secondary']}`}>Medium</button>
        <button className={`${classes['btn']} ${classes['btn-lg']} ${classes['btn-secondary']}`}>Large</button>
      </div>

      <div className={classes['row']}>
        <span className={classes['label']}>Danger</span>
        <button className={`${classes['btn']} ${classes['btn-sm']} ${classes['btn-danger']}`}>Delete</button>
        <button className={`${classes['btn']} ${classes['btn-md']} ${classes['btn-danger']}`}>Remove Item</button>
      </div>

      <div className={classes['row']}>
        <span className={classes['label']}>Ghost</span>
        <button className={`${classes['btn']} ${classes['btn-sm']} ${classes['btn-ghost']}`}>Cancel</button>
        <button className={`${classes['btn']} ${classes['btn-md']} ${classes['btn-ghost']}`}>Skip</button>
        <button className={`${classes['btn']} ${classes['btn-lg']} ${classes['btn-ghost']}`}>Later</button>
      </div>
    </div>
  )
}
