import { useState } from 'react'
import {
  LayoutDashboard, Package, Brain, Zap, BarChart3, CreditCard,
  Search, Bell, Settings, ChevronRight, Activity
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Intelligence from './pages/Intelligence'
import Distribution from './pages/Distribution'
import Analytics from './pages/Analytics'
import Pricing from './pages/Pricing'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, section: 'Core' },
  { id: 'products',     label: 'Products',      icon: Package,         section: 'Core', badge: '5' },
  { id: 'intelligence', label: 'Intelligence',  icon: Brain,           section: 'Engine', badge: 'LIVE', live: true },
  { id: 'distribution', label: 'Distribution',  icon: Zap,             section: 'Engine' },
  { id: 'analytics',    label: 'Analytics',     icon: BarChart3,       section: 'Reports' },
  { id: 'pricing',      label: 'Pricing',       icon: CreditCard,      section: 'Reports' },
]

const PAGES = {
  dashboard: Dashboard,
  products: Products,
  intelligence: Intelligence,
  distribution: Distribution,
  analytics: Analytics,
  pricing: Pricing,
}

const TITLES = {
  dashboard: 'Dashboard',
  products: 'Products',
  intelligence: 'Intelligence Engine',
  distribution: 'Distribution Engine',
  analytics: 'Analytics',
  pricing: 'Pricing',
}

function Sidebar({ current, onNav }) {
  const sections = [...new Set(NAV.map(n => n.section))]

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="logo-text">
          <div className="logo-name">OUTRIQ</div>
          <div className="logo-sub">AI Marketing Engine</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {NAV.filter(n => n.section === section).map(item => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={`nav-item ${current === item.id ? 'active' : ''}`}
                  onClick={() => onNav(item.id)}
                >
                  <Icon className="nav-icon" size={15} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge ${item.live ? 'live' : ''}`}>{item.badge}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, border: '1.5px solid rgba(139,92,246,0.4)' }}>AI</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.1px' }}>Aniekan Israel</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>aniekaneazy@gmail.com</div>
          </div>
        </div>
        <div className="system-status">
          <div className="status-dot" />
          <span>All systems operational</span>
        </div>
        <div style={{ marginTop: 7, fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}>
          v1.0.0 · April 2026
        </div>
      </div>
    </aside>
  )
}

function TopBar({ current }) {
  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span style={{ color: 'var(--text-4)', fontSize: 12 }}>OUTRIQ</span>
        <ChevronRight size={11} style={{ color: 'var(--text-4)' }} />
        <span className="topbar-title">{TITLES[current]}</span>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-search">
        <Search size={12} />
        <input placeholder="Search products, signals..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Activity">
          <Activity size={15} />
        </button>
        <button className="icon-btn" title="Notifications">
          <Bell size={15} />
          <span className="notif-dot" />
        </button>
        <button className="icon-btn" title="Settings">
          <Settings size={15} />
        </button>
        <div className="avatar" title="Aniekan Israel · aniekaneazy@gmail.com">AI</div>
      </div>
    </header>
  )
}

export default function App() {
  const [current, setCurrent] = useState('dashboard')
  const Page = PAGES[current]

  return (
    <div className="app-shell">
      <Sidebar current={current} onNav={setCurrent} />
      <div className="main-area">
        <TopBar current={current} />
        <main className="page-content">
          <Page onNavigate={setCurrent} />
        </main>
      </div>
    </div>
  )
}
