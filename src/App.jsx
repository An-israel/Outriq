import { useState } from 'react'
import {
  LayoutDashboard, Package, Brain, Zap, BarChart3, CreditCard,
  Search, Bell, Settings, ChevronRight, Activity, LogOut, Loader
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Intelligence from './pages/Intelligence'
import Distribution from './pages/Distribution'
import Analytics from './pages/Analytics'
import Pricing from './pages/Pricing'
import { useAuth } from './hooks/useAuth'

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

function Sidebar({ current, onNav, user, onLogout }) {
  const sections = [...new Set(NAV.map(n => n.section))]

  return (
    <aside className="sidebar">
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
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, border: '1.5px solid rgba(139,92,246,0.4)' }}>
            {user?.name?.slice(0,2).toUpperCase() || 'AI'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.1px' }}>{user?.name || 'Aniekan Israel'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'aniekaneazy@gmail.com'}</div>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4, borderRadius: 6, flexShrink: 0 }} title="Log out">
            <LogOut size={13} />
          </button>
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

function TopBar({ current, user }) {
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
        <button className="icon-btn" title="Activity"><Activity size={15} /></button>
        <button className="icon-btn" title="Notifications">
          <Bell size={15} />
          <span className="notif-dot" />
        </button>
        <button className="icon-btn" title="Settings"><Settings size={15} /></button>
        <div className="avatar" title={`${user?.name} · ${user?.email}`}>
          {user?.name?.slice(0,2).toUpperCase() || 'AI'}
        </div>
      </div>
    </header>
  )
}

// ── Login / Register screen ───────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('aniekaneazy@gmail.com')
  const [password, setPassword] = useState('outriq2026')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login, register }     = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = mode === 'login'
        ? await login(email, password)
        : await register(name, email, password)
      onAuth(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '5%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 36px', width: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, background: 'linear-gradient(135deg,#c4b5fd,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.4px' }}>OUTRIQ</div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '1.8px', textTransform: 'uppercase' }}>AI Marketing Engine</div>
          </div>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
          {mode === 'login' ? 'Sign in to your AI marketing dashboard' : 'Start your autonomous marketing engine'}
        </p>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 12.5, marginBottom: 18 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Aniekan Israel" required />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ fontSize: 14, padding: '12px 20px' }}>
            {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--violet-400)', fontWeight: 600, fontSize: 12.5 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
          Demo: aniekaneazy@gmail.com / outriq2026
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading, logout } = useAuth()
  const [authed, setAuthed]       = useState(false)
  const [current, setCurrent]     = useState('dashboard')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading OUTRIQ...</div>
        </div>
      </div>
    )
  }

  if (!user && !authed) {
    return <AuthScreen onAuth={() => setAuthed(true)} />
  }

  const Page = PAGES[current]

  return (
    <div className="app-shell">
      <Sidebar current={current} onNav={setCurrent} user={user} onLogout={() => { logout(); setAuthed(false) }} />
      <div className="main-area">
        <TopBar current={current} user={user} />
        <main className="page-content">
          <Page onNavigate={setCurrent} />
        </main>
      </div>
    </div>
  )
}
