import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Package, Brain, Zap, BarChart3, CreditCard,
  Search, Bell, Settings, ChevronRight, Activity, LogOut, Loader,
  Eye, EyeOff, ArrowLeft, RefreshCw
} from 'lucide-react'
import Dashboard    from './pages/Dashboard'
import Products     from './pages/Products'
import Intelligence from './pages/Intelligence'
import Distribution from './pages/Distribution'
import Analytics    from './pages/Analytics'
import Pricing      from './pages/Pricing'
import Landing      from './pages/Landing'
import { useAuth }           from './hooks/useAuth'
import { api, setToken }     from './api/client'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, section: 'CORE' },
  { id: 'products',     label: 'Products',      icon: Package,         section: 'CORE' },
  { id: 'intelligence', label: 'Intelligence',  icon: Brain,           section: 'ENGINE', badge: 'LIVE', live: true },
  { id: 'distribution', label: 'Distribution',  icon: Zap,             section: 'ENGINE' },
  { id: 'analytics',    label: 'Analytics',     icon: BarChart3,       section: 'REPORTS' },
  { id: 'pricing',      label: 'Pricing',       icon: CreditCard,      section: 'REPORTS' },
]

const PAGES = {
  dashboard: Dashboard, products: Products, intelligence: Intelligence,
  distribution: Distribution, analytics: Analytics, pricing: Pricing,
}

const TITLES = {
  dashboard: 'Dashboard', products: 'Products', intelligence: 'Intelligence Engine',
  distribution: 'Distribution Engine', analytics: 'Analytics', pricing: 'Pricing',
}

// ── Error Boundary ────────────────────────────────────────────
import { Component } from 'react'
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(err) { return { error: err } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 20, fontFamily: 'var(--font-mono)' }}>{this.state.error.message}</div>
          <button className="btn btn-secondary" onClick={() => this.setState({ error: null })}>Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ current, onNav, user, onLogout, productCount }) {
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
              const badge = item.id === 'products' ? (productCount > 0 ? String(productCount) : null) : item.badge
              return (
                <div key={item.id} className={`nav-item ${current === item.id ? 'active' : ''}`} onClick={() => onNav(item.id)}>
                  <Icon className="nav-icon" size={15} />
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
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, border: '1.5px solid rgba(139,92,246,0.4)' }}>
            {user?.name?.slice(0,2).toUpperCase() || 'AI'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.1px' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4, borderRadius: 6, flexShrink: 0 }} title="Log out">
            <LogOut size={13} />
          </button>
        </div>
        <div className="system-status"><div className="status-dot" /><span>All systems operational</span></div>
        <div style={{ marginTop: 7, fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>v1.0.0 · {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}</div>
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
        <button className="icon-btn" title="Notifications"><Bell size={15} /><span className="notif-dot" /></button>
        <button className="icon-btn" title="Settings"><Settings size={15} /></button>
        <div className="avatar" title={user?.name}>{user?.name?.slice(0,2).toUpperCase() || 'AI'}</div>
      </div>
    </header>
  )
}

// ── Auth card wrapper ─────────────────────────────────────────
function AuthCard({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 20 }}>
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '5%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
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
        {children}
      </div>
    </div>
  )
}

// ── Login Screen ──────────────────────────────────────────────
function LoginScreen({ onAuth, onGoRegister, onBackToLanding }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [verifyData, setVerifyData] = useState(null)
  const { login }               = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
      onAuth()
    } catch (err) {
      if (err.needsVerify) {
        setVerifyData({ userId: err.userId, email: err.email, demoCode: err.demoCode })
        return
      }
      setError(err.message)
    } finally { setLoading(false) }
  }

  if (verifyData) {
    return <VerifyScreen userId={verifyData.userId} email={verifyData.email} demoCode={verifyData.demoCode} onVerified={onAuth} onBack={() => setVerifyData(null)} />
  }

  return (
    <AuthCard>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Welcome back</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Sign in to your AI marketing dashboard</p>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 12.5, marginBottom: 18 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ fontSize: 14, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>
        Don't have an account?{' '}
        <button onClick={onGoRegister} style={linkBtn}>Sign up</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button onClick={onBackToLanding} style={backBtn}><ArrowLeft size={11} /> Back to home</button>
      </div>
    </AuthCard>
  )
}

// ── Register Screen ───────────────────────────────────────────
function RegisterScreen({ onGoLogin, onNeedsVerify, onBackToLanding }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const data = await api.post('/auth/register', { name: name.trim(), email: email.trim(), password })
      onNeedsVerify({ userId: data.userId, email: data.email, demoCode: data.demoCode })
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <AuthCard>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 6 }}>Create account</h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Start your autonomous marketing engine</p>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 12.5, marginBottom: 18 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Full Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required autoFocus />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Password <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(min 6 chars)</span></label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPwd(v => !v)} style={eyeBtn}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ fontSize: 14, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>
        Already have an account?{' '}
        <button onClick={onGoLogin} style={linkBtn}>Sign in</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button onClick={onBackToLanding} style={backBtn}><ArrowLeft size={11} /> Back to home</button>
      </div>
    </AuthCard>
  )
}

// ── Email Verify Screen ───────────────────────────────────────
function VerifyScreen({ userId, email, demoCode, onVerified, onBack }) {
  const [code, setCode]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  async function handleVerify(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await api.post('/auth/verify-email', { userId, code: code.trim() })
      setToken(data.token)
      onVerified()
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  async function handleResend() {
    setResending(true); setError(''); setSuccess('')
    try {
      const data = await api.post('/auth/resend-verify', { userId })
      setSuccess(`New code sent! ${data.demoCode ? `(Demo code: ${data.demoCode})` : 'Check your email.'}`)
    } catch (err) {
      setError(err.message)
    } finally { setResending(false) }
  }

  return (
    <AuthCard>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📧</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 8 }}>Check your email</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</strong>
        </p>
      </div>

      {/* Demo notice — shows code since no real email server is set up */}
      {demoCode && (
        <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(139,92,246,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Your verification code</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#c4b5fd', fontFamily: 'var(--font-mono)', letterSpacing: 6 }}>{demoCode}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Expires in 15 minutes</div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 12.5, marginBottom: 18 }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '10px 14px', color: '#6ee7b7', fontSize: 12.5, marginBottom: 18 }}>{success}</div>}

      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Verification Code</label>
          <input
            className="form-input"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            required
            autoFocus
            maxLength={6}
            style={{ fontSize: 24, fontFamily: 'var(--font-mono)', letterSpacing: 8, textAlign: 'center' }}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading || code.length < 6} style={{ fontSize: 14, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>
        Didn't get the code?{' '}
        <button onClick={handleResend} disabled={resending} style={linkBtn}>
          {resending ? <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite', display: 'inline' }} /> Resending...</> : 'Resend code'}
        </button>
      </div>
      {onBack && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button onClick={onBack} style={backBtn}><ArrowLeft size={11} /> Back</button>
        </div>
      )}
    </AuthCard>
  )
}

// ── Shared styles ─────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }
const eyeBtn     = { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2, display: 'flex', alignItems: 'center' }
const linkBtn    = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--violet-400)', fontWeight: 600, fontSize: 12.5 }
const backBtn    = { background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const { user, loading, logout } = useAuth()
  const [screen, setScreen]       = useState('landing') // landing | login | register | verify
  const [verifyData, setVerifyData] = useState(null)
  const [authed, setAuthed]       = useState(false)
  const [current, setCurrent]     = useState('dashboard')
  const [productCount, setProductCount] = useState(0)

  // Fetch product count for sidebar badge
  useEffect(() => {
    if (user || authed) {
      api.get('/products').then(list => setProductCount(Array.isArray(list) ? list.length : 0)).catch(() => {})
    }
  }, [user, authed, current])

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

  // ── Dashboard shell (logged in) ───────────────────────────────
  if (user || authed) {
    const Page = PAGES[current] || Dashboard
    return (
      <div className="app-shell">
        <Sidebar current={current} onNav={setCurrent} user={user} productCount={productCount}
          onLogout={() => { logout(); setAuthed(false); setScreen('landing') }} />
        <div className="main-area">
          <TopBar current={current} user={user} />
          <main className="page-content">
            <ErrorBoundary key={current}>
              <Page onNavigate={setCurrent} />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    )
  }

  // ── Landing ───────────────────────────────────────────────────
  if (screen === 'landing') {
    return <Landing onGetStarted={() => setScreen('register')} onSignIn={() => setScreen('login')} />
  }

  // ── Register → verify ─────────────────────────────────────────
  if (screen === 'register') {
    return (
      <RegisterScreen
        onGoLogin={() => setScreen('login')}
        onBackToLanding={() => setScreen('landing')}
        onNeedsVerify={(data) => { setVerifyData(data); setScreen('verify') }}
      />
    )
  }

  // ── Email verification ────────────────────────────────────────
  if (screen === 'verify' && verifyData) {
    return (
      <VerifyScreen
        userId={verifyData.userId}
        email={verifyData.email}
        demoCode={verifyData.demoCode}
        onVerified={() => setAuthed(true)}
        onBack={() => setScreen('register')}
      />
    )
  }

  // ── Login ─────────────────────────────────────────────────────
  return (
    <LoginScreen
      onAuth={() => setAuthed(true)}
      onGoRegister={() => setScreen('register')}
      onBackToLanding={() => setScreen('landing')}
    />
  )
}
