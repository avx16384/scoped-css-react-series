import { useState } from 'react'
import { useCSS } from '@gmono/scoped-css-react'

const NAV_ITEMS = ['Dashboard', 'Analytics', 'Reports', 'Settings', 'Help']

export function ResponsiveLayout() {
  const { classes, style } = useCSS(`
    .layout {
      display: flex;
      gap: 1.5rem;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: white;
      min-height: 320px;
    }

    .sidebar {
      width: 200px;
      flex-shrink: 0;
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
      padding: 1rem;
    }

    .sidebar-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 0.75rem;
      padding-left: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #475569;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-family: inherit;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nav-item:hover { background: #e2e8f0; }
    .nav-item-active {
      background: #6366f1;
      color: white;
    }
    .nav-item-active:hover { background: #4f46e5; }

    .content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
    .content-header {
      margin-bottom: 1rem;
    }
    .content-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }
    .content-breadcrumb {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 0.25rem;
    }
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #6366f1;
    }
    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.2rem;
    }

    .mobile-toggle {
      display: none;
      border: none;
      background: #6366f1;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      margin-bottom: 0.75rem;
    }

    /* Tablet: narrower sidebar */
    @media (max-width: 900px) {
      .sidebar { width: 150px; }
      .content { padding: 1rem; }
    }

    /* Mobile: sidebar collapses, toggle button appears */
    @media (max-width: 600px) {
      .layout { flex-direction: column; }
      .mobile-toggle { display: inline-block; }
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #e2e8f0;
      }
      .sidebar-hidden { display: none; }
      .content-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* Very small: single column stats */
    @media (max-width: 380px) {
      .content-grid { grid-template-columns: 1fr; }
    }
  `)

  const [activeNav, setActiveNav] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    { value: '12.4k', label: 'Visitors' },
    { value: '892', label: 'Sign-ups' },
    { value: '34%', label: 'Conversion' },
    { value: '$4.2k', label: 'Revenue' },
  ]

  return (
    <div>
      {style}
      <button className={classes['mobile-toggle']} onClick={() => setSidebarOpen((s) => !s)}>
        {sidebarOpen ? '☰ Hide Menu' : '☰ Show Menu'}
      </button>
      <div className={classes['layout']}>
        <aside className={`${classes['sidebar']} ${!sidebarOpen ? classes['sidebar-hidden'] : ''}`}>
          <div className={classes['sidebar-title']}>Navigation</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className={`${classes['nav-item']} ${activeNav === item ? classes['nav-item-active'] : ''}`}
              onClick={() => {
                setActiveNav(item)
                setSidebarOpen(false)
              }}
            >
              {item}
            </button>
          ))}
        </aside>
        <main className={classes['content']}>
          <div className={classes['content-header']}>
            <div className={classes['content-breadcrumb']}>Pages / {activeNav}</div>
            <h3 className={classes['content-title']}>{activeNav}</h3>
          </div>
          <div className={classes['content-grid']}>
            {stats.map((stat) => (
              <div key={stat.label} className={classes['stat-card']}>
                <div className={classes['stat-value']}>{stat.value}</div>
                <div className={classes['stat-label']}>{stat.label}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
