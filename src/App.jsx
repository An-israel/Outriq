import { useState, useEffect, Component } from 'react'
import {
  LayoutDashboard, Package, BarChart3, CreditCard,
  Target, Zap, Search, Bell, Settings, ChevronRight,
  Activity, LogOut, Loader, Eye, EyeOff, ArrowLeft, RefreshCw,
  ShieldCheck, Menu
} from 'lucide-react'
import Dashboard     from './pages/Dashboard'
import Products      from './pages/Products'
import Opportunities from './pages/Opportunities'
import Distribution  from './pages/Distribution'
import Analytics     from './pages/Analytics'
import Pricing       from './pages/Pricing'
import Landing       from './pages/Landing'
import SettingsPanel from './pages/Settings'
import { useAuth }          from './hooks/useAuth'
import { api, setToken }    from './api/client'

const ADMIN_EMAIL = 'aniekaneazy@gmail.com'

// Nav for regular users
const USER_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'OVERVIEW' },
  { id: 'products',  label: 'Products',   icon: Package,         section: 'OVERVIEW' },
  { id: 'analytics', label: 'Analytics',  icon: BarChart3,       section: 'REPORTS' },
  { id: 'pricing',   label: 'Pricing',    icon: CreditCard,      section: 'REPORTS' },
]

// Nav for admin — full access
const ADMIN_NAV = [
  { id: 'dashboard',      label: 'Dashboard',      icon: LayoutDashboard, section: 'OVERVIEW' },
  { id: 'products',       label: 'Products',        icon: Package,         section: 'OVERVIEW' },
  { id: 'opportunities',  label: 'Opportunities',   icon: Target,          section: 'ENGINE', badge: 'LIVE', live: true },
  { id: 'distribution',   label: 'Distribution',    icon: Zap,             section: 'ENGINE' },
  { id: 'analytics',      label: 'Analytics',       icon: BarChart3,       section: 'REPORTS' },
  { id: 'pricing',        label: 'Pricing',         icon: CreditCard,      section: 'REPORTS' },
]

const PAGES = {
  dashboard: Dashboard, products: Products, opportunities: Opportunities,
  distribution: Distribution, analytics: Analytics, pricing: Pricing,
}

const TITLES = {
  dashboard: 'Dashboard', products: 'Products', opportunities: 'Opportunities',
  distribution: 'Distribution', analytics: 'Analytics', pricing: 'Pricing',
}

// ── Error Boundary ────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(err) { return { error: err } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>{this.state.error.message}</div>
        <button className="btn btn-secondary btn-sm" onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    )
    return this.props.children
  }
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ current, onNav, user, onLogout, productCount, isAdmin, open, onClose }) {
  const nav = isAdmin ? ADMIN_NAV : USER_NAV
  const sections = [...new Set(nav.map(n => n.section))]

  return (
    <>
      {open && <div className="sidebar-overlay open" onClick={onClose} />}
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            {nav.filter(n => n.section === section).map(item => {
              const Icon = item.icon
              const badge = item.id === 'products' ? (productCount > 0 ? String(productCount) : null) : item.badge
              return (
                <div key={item.id} className={`nav-item ${current === item.id ? 'active' : ''}`} onClick={() => onNav(item.id)}>
                  <Icon className="nav-icon" size={14} />
                  <span>{item.label}</span>
                  {badge && <span className={`nav-badge ${item.live ? 'live' : ''}`}>{badge}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.name?.slice(0,2).toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <ShieldCheck size={9} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 9.5, color: 'var(--accent)', fontWeight: 600 }}>Admin</span>
              </div>
            )}
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4, borderRadius: 6, flexShrink: 0, display: 'flex' }} title="Log out">
            <LogOut size={13} />
          </button>
        </div>
        <div className="system-status"><div className="status-dot" /><span>All systems operational</span></div>
      </div>
    </aside>
    </>
  )
}

function TopBar({ current, user, onSettings, onNotifications, onActivity, onMenuClick }) {
  return (
    <header className="topbar">
      <button className="hamburger-btn" onClick={onMenuClick} aria-label="Menu">
        <Menu size={20} />
      </button>
      <div className="topbar-breadcrumb">
        <span style={{ color: 'var(--text-4)', fontSize: 12 }}>OUTRIQ</span>
        <ChevronRight size={11} style={{ color: 'var(--text-4)' }} />
        <span className="topbar-title">{TITLES[current]}</span>
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-search">
        <Search size={12} />
        <input placeholder="Search..." />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" title="Activity" onClick={onActivity}><Activity size={15} /></button>
        <button className="icon-btn" title="Notifications" onClick={onNotifications}><Bell size={15} /><span className="notif-dot" /></button>
        <button className="icon-btn" title="Settings" onClick={onSettings}><Settings size={15} /></button>
        <div className="avatar" title={user?.name} onClick={onSettings} style={{ cursor: 'pointer' }}>
          {user?.name?.slice(0,2).toUpperCase() || '?'}
        </div>
      </div>
    </header>
  )
}

// ── Shared auth card wrapper ──────────────────────────────────
function AuthCard({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#252220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.3px' }}>OUTRIQ</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-4)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>AI Marketing</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

const labelSt  = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }
const eyeBtnSt = { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 2, display: 'flex', alignItems: 'center' }
const linkBtnSt= { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 13 }
const backBtnSt= { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }

// ── Login ─────────────────────────────────────────────────────
function LoginScreen({ onAuth, onGoRegister, onBack, onForgot }) {
  const [email, setEmail]     = useState('')
  const [pw, setPw]           = useState('')
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [verifyData, setVD]   = useState(null)
  const { login }             = useAuth()

  if (verifyData) return <VerifyScreen {...verifyData} onVerified={onAuth} onBack={() => setVD(null)} />

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('')
    try { await login(email, pw); onAuth() }
    catch (err) {
      if (err.needsVerify) { setVD({ userId: err.userId, email: err.email, demoCode: err.demoCode }); return }
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <AuthCard>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, letterSpacing: -0.5 }}>Welcome back</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>Sign in to your dashboard</p>
      {error && <div style={errSt}>{error}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelSt}>Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={labelSt}>Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShow(v => !v)} style={eyeBtnSt}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 8, fontSize: 14, padding: '11px 20px' }}>
          {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button onClick={onForgot} style={linkBtnSt}>Forgot password?</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-3)' }}>
        No account? <button onClick={onGoRegister} style={linkBtnSt}>Create one</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button onClick={onBack} style={backBtnSt}><ArrowLeft size={11} /> Back</button>
      </div>
    </AuthCard>
  )
}

// ── Register ──────────────────────────────────────────────────
function RegisterScreen({ onGoLogin, onNeedsVerify, onBack }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [show, setShow]   = useState(false)
  const [loading, setL]   = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (pw.length < 6) { setError('Password must be at least 6 characters'); return }
    setL(true); setError('')
    try {
      const data = await api.post('/auth/register', { name: name.trim(), email: email.trim(), password: pw })
      onNeedsVerify({ userId: data.userId, email: data.email, demoCode: data.demoCode })
    } catch (err) { setError(err.message) }
    finally { setL(false) }
  }

  return (
    <AuthCard>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, letterSpacing: -0.5 }}>Create account</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>Start your autonomous marketing engine</p>
      {error && <div style={errSt}>{error}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelSt}>Full name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required autoFocus />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelSt}>Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={labelSt}>Password <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>(min 6 chars)</span></label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Create a password" required style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShow(v => !v)} style={eyeBtnSt}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 8, fontSize: 14, padding: '11px 20px' }}>
          {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-3)' }}>
        Already have an account? <button onClick={onGoLogin} style={linkBtnSt}>Sign in</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button onClick={onBack} style={backBtnSt}><ArrowLeft size={11} /> Back</button>
      </div>
    </AuthCard>
  )
}

// ── Verify ────────────────────────────────────────────────────
function VerifyScreen({ userId, email, demoCode: initialCode, onVerified, onBack }) {
  const [code, setCode]       = useState('')
  const [loading, setL]       = useState(false)
  const [resending, setR]     = useState(false)
  const [error, setError]     = useState('')
  const [liveCode, setLiveCode] = useState(initialCode)

  async function verify(e) {
    e.preventDefault(); setL(true); setError('')
    try {
      const data = await api.post('/auth/verify-email', { userId, code: code.trim() })
      setToken(data.token); onVerified()
    } catch (err) { setError(err.message) }
    finally { setL(false) }
  }

  async function resend() {
    setR(true); setError('')
    try {
      const data = await api.post('/auth/resend-verify', { userId })
      if (data.demoCode) setLiveCode(data.demoCode)
    } catch (err) { setError(err.message) }
    finally { setR(false) }
  }

  return (
    <AuthCard>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📧</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Verify your email</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
          We sent a 6-digit code to <strong style={{ color: 'var(--text-2)' }}>{email}</strong>
        </p>
      </div>

      {liveCode && (
        <div style={{ background: 'rgba(207,108,79,0.1)', border: '1px solid rgba(207,108,79,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Your verification code</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-1)', letterSpacing: 8, fontFamily: 'monospace' }}>{liveCode}</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Expires in 15 minutes</div>
        </div>
      )}

      {error && <div style={errSt}>{error}</div>}

      <form onSubmit={verify}>
        <div style={{ marginBottom: 20 }}>
          <label style={labelSt}>6-digit code</label>
          <input className="form-input" value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6} required autoFocus style={{ textAlign: 'center', fontSize: 22, letterSpacing: 10, fontFamily: 'monospace' }} />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading || code.length < 6} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 8, fontSize: 14, padding: '11px 20px' }}>
          {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-3)' }}>
        Didn't get it?{' '}
        <button onClick={resend} disabled={resending} style={linkBtnSt}>
          {resending ? <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite', display:'inline', marginRight: 4 }} />Resending...</> : 'Resend code'}
        </button>
      </div>
      {onBack && <div style={{ textAlign: 'center', marginTop: 8 }}><button onClick={onBack} style={backBtnSt}><ArrowLeft size={11} /> Back</button></div>}
    </AuthCard>
  )
}

// ── Forgot Password ──────────────────────────────────────────
function ForgotPasswordScreen({ onBack, onAuth }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [resetData, setRD]    = useState(null)

  if (resetData) return <ResetPasswordScreen {...resetData} onAuth={onAuth} onBack={() => setRD(null)} />

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const data = await api.post('/auth/forgot-password', { email: email.trim() })
      setRD({ userId: data.userId, email: data.email, demoCode: data.demoCode })
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <AuthCard>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, letterSpacing: -0.5 }}>Forgot password?</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>Enter your email and we'll send you a reset code</p>
      {error && <div style={errSt}>{error}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 22 }}>
          <label style={labelSt}>Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 8, fontSize: 14, padding: '11px 20px' }}>
          {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={onBack} style={backBtnSt}><ArrowLeft size={11} /> Back to login</button>
      </div>
    </AuthCard>
  )
}

// ── Reset Password ───────────────────────────────────────────
function ResetPasswordScreen({ userId, email, demoCode: initialCode, onAuth, onBack }) {
  const [code, setCode]     = useState('')
  const [pw, setPw]         = useState('')
  const [show, setShow]     = useState(false)
  const [loading, setL]     = useState(false)
  const [error, setError]   = useState('')
  const [liveCode, setLC]   = useState(initialCode)

  async function submit(e) {
    e.preventDefault(); setL(true); setError('')
    try {
      const data = await api.post('/auth/reset-password', { userId, code: code.trim(), newPassword: pw })
      setToken(data.token); onAuth()
    } catch (err) { setError(err.message) }
    finally { setL(false) }
  }

  async function resend() {
    setError('')
    try {
      const data = await api.post('/auth/forgot-password', { email })
      if (data.demoCode) setLC(data.demoCode)
    } catch (err) { setError(err.message) }
  }

  return (
    <AuthCard>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔑</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Reset your password</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
          We sent a 6-digit code to <strong style={{ color: 'var(--text-2)' }}>{email}</strong>
        </p>
      </div>

      {liveCode && (
        <div style={{ background: 'rgba(207,108,79,0.1)', border: '1px solid rgba(207,108,79,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Your reset code</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-1)', letterSpacing: 8, fontFamily: 'monospace' }}>{liveCode}</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Expires in 15 minutes</div>
        </div>
      )}

      {error && <div style={errSt}>{error}</div>}

      <form onSubmit={submit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelSt}>6-digit code</label>
          <input className="form-input" value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6} required autoFocus style={{ textAlign: 'center', fontSize: 22, letterSpacing: 10, fontFamily: 'monospace' }} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={labelSt}>New password <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>(min 6 chars)</span></label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter new password" required style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShow(v => !v)} style={eyeBtnSt}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading || code.length < 6 || pw.length < 6} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 8, fontSize: 14, padding: '11px 20px' }}>
          {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Resetting...' : 'Reset Password & Sign In'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-3)' }}>
        Didn't get it?{' '}
        <button onClick={resend} style={linkBtnSt}>Resend code</button>
      </div>
      {onBack && <div style={{ textAlign: 'center', marginTop: 8 }}><button onClick={onBack} style={backBtnSt}><ArrowLeft size={11} /> Back</button></div>}
    </AuthCard>
  )
}

const errSt = { background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 8, padding: '9px 12px', color: 'var(--red-400)', fontSize: 12.5, marginBottom: 16 }

// ── App root ──────────────────────────────────────────────────
export default function App() {
  const { user, loading, logout } = useAuth()
  const [screen, setScreen]       = useState('landing')
  const [verifyData, setVD]       = useState(null)
  const [authed, setAuthed]       = useState(false)
  const [current, setCurrent]     = useState('dashboard')
  const [productCount, setPC]     = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab]   = useState('profile')
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  const isAdmin = user?.email === ADMIN_EMAIL

  // Fetch product count for sidebar badge
  useEffect(() => {
    if (user || authed) {
      api.get('/products').then(list => setPC(Array.isArray(list) ? list.length : 0)).catch(() => {})
    }
  }, [user, authed, current])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Loading...</div>
      </div>
    </div>
  )

  // ── Dashboard shell ───────────────────────────────────────────
  if (user || authed) {
    const Page = PAGES[current] || Dashboard
    return (
      <>
        <div className="app-shell">
          <Sidebar current={current} onNav={id => { setCurrent(id); setSidebarOpen(false) }} user={user} productCount={productCount} isAdmin={isAdmin}
            open={sidebarOpen} onClose={() => setSidebarOpen(false)}
            onLogout={() => { logout(); setAuthed(false); setScreen('landing') }} />
          <div className="main-area">
            <TopBar current={current} user={user}
              onMenuClick={() => setSidebarOpen(v => !v)}
              onSettings={() => { setSettingsTab('profile'); setShowSettings(true) }}
              onNotifications={() => { setSettingsTab('notifications'); setShowSettings(true) }}
              onActivity={() => { setSettingsTab('activity'); setShowSettings(true) }}
            />
            <main className="page-content">
              <ErrorBoundary key={current}>
                <Page onNavigate={setCurrent} />
              </ErrorBoundary>
            </main>
          </div>
        </div>
        {showSettings && (
          <SettingsPanel user={user} initialTab={settingsTab} onClose={() => setShowSettings(false)} />
        )}
      </>
    )
  }

  if (screen === 'landing') return <Landing onGetStarted={() => setScreen('register')} onSignIn={() => setScreen('login')} />
  if (screen === 'register') return (
    <RegisterScreen
      onGoLogin={() => setScreen('login')}
      onBack={() => setScreen('landing')}
      onNeedsVerify={data => { setVD(data); setScreen('verify') }}
    />
  )
  if (screen === 'verify' && verifyData) return (
    <VerifyScreen {...verifyData} onVerified={() => setAuthed(true)} onBack={() => setScreen('register')} />
  )
  if (screen === 'forgot') return (
    <ForgotPasswordScreen onAuth={() => setAuthed(true)} onBack={() => setScreen('login')} />
  )
  return <LoginScreen onAuth={() => setAuthed(true)} onGoRegister={() => setScreen('register')} onBack={() => setScreen('landing')} onForgot={() => setScreen('forgot')} />
}
