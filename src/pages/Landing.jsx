import { Zap, Brain, BarChart3, ArrowRight, CheckCircle, Activity } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    color: '#cf6c4f',
    bg: 'rgba(207,108,79,0.1)',
    title: 'Intent Signal Detection',
    desc: 'Monitors Nairaland, X, LinkedIn, Reddit and more — 24/7 — for people expressing a need your product solves.',
  },
  {
    icon: Activity,
    color: '#c4a882',
    bg: 'rgba(196,168,130,0.1)',
    title: 'Two-Stage AI Matching',
    desc: 'Every signal is scored 0–100 by Claude AI. Only high-confidence matches (65+) trigger any action.',
  },
  {
    icon: Zap,
    color: '#cf6c4f',
    bg: 'rgba(207,108,79,0.08)',
    title: 'Autonomous Distribution',
    desc: '5 modules execute automatically: AI replies, SEO articles, GEO optimisation, personalised outreach, landing pages.',
  },
]

const STATS = [
  { val: '1,289', label: 'Signals Detected',  color: '#cf6c4f' },
  { val: '342',   label: 'Actions Executed',   color: '#c4a882' },
  { val: '158',   label: 'Leads Generated',    color: '#cf6c4f' },
  { val: '94%',   label: 'Content Pass Rate',  color: '#c4a882' },
]

const BULLETS = [
  'Works while you sleep — fully autonomous',
  'Nigerian-context AI — understands your market',
  'Zero templates — every response generated fresh',
  'NDPR/GDPR compliant by design',
]

export default function Landing({ onGetStarted, onSignIn }) {
  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', color: '#f5f0eb', fontFamily: 'inherit', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(245,240,235,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#cf6c4f', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#f5f0eb', letterSpacing: '-0.3px' }}>OUTRIQ</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onSignIn} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b847a', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, transition: 'color 180ms' }}
            onMouseEnter={e => e.target.style.color='#f5f0eb'} onMouseLeave={e => e.target.style.color='#8b847a'}>
            Sign In
          </button>
          <button onClick={onGetStarted} className="btn btn-primary" style={{ fontSize: 13, padding: '8px 20px' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '96px 24px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(207,108,79,0.1)', border: '1px solid rgba(207,108,79,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cf6c4f', display: 'inline-block' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#c4bdb5', letterSpacing: '0.5px' }}>AI Engine Active — Monitoring 8 Platforms</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px,6vw,72px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px', color: '#f5f0eb' }}>
          Find Your Customers{' '}
          <span style={{ color: '#cf6c4f' }}>
            Before They Find
          </span>
          {' '}Your Competitors
        </h1>

        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: '#8b847a', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
          OUTRIQ monitors social platforms, detects purchase intent in real-time, and automatically executes personalised marketing — 24 hours a day, 7 days a week.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onGetStarted} className="btn btn-primary" style={{ fontSize: 15, padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
            Start Free <ArrowRight size={15} />
          </button>
          <button onClick={onSignIn} style={{ background: 'rgba(245,240,235,0.04)', border: '1px solid rgba(245,240,235,0.1)', color: '#c4bdb5', borderRadius: 10, cursor: 'pointer', fontSize: 15, padding: '14px 32px', fontWeight: 600, transition: 'background 180ms' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(245,240,235,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(245,240,235,0.04)'}>
            Sign In
          </button>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: '#252220', border: '1px solid rgba(245,240,235,0.06)', borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -1.5, marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#5a534d', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5a534d', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, letterSpacing: '-1px', color: '#f5f0eb' }}>Three Stages. Fully Automatic.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} style={{ background: '#252220', border: '1px solid rgba(245,240,235,0.06)', borderRadius: 20, padding: '28px 24px', borderTop: `2px solid ${f.color}50` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px', color: '#f5f0eb' }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: '#8b847a', lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Built-in benefits */}
      <section style={{ padding: '0 24px 96px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: '#252220', border: '1px solid rgba(245,240,235,0.06)', borderRadius: 24, padding: '40px 36px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, letterSpacing: '-0.5px', color: '#f5f0eb' }}>Everything You Need. Nothing You Don't.</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginBottom: 36 }}>
            {BULLETS.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: '#cf6c4f', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 14, color: '#c4bdb5', lineHeight: 1.55 }}>{b}</span>
              </div>
            ))}
          </div>
          <button onClick={onGetStarted} className="btn btn-primary" style={{ fontSize: 14, padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Launch Your Engine <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(245,240,235,0.05)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, background: '#cf6c4f', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#5a534d', letterSpacing: '1px' }}>OUTRIQ</span>
        </div>
        <span style={{ fontSize: 11.5, color: '#5a534d' }}>Autonomous AI Marketing Engine · {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
