import { Zap, Brain, BarChart3, ArrowRight, CheckCircle, Activity } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    title: 'Intent Signal Detection',
    desc: 'Monitors Nairaland, X, LinkedIn, Reddit and more — 24/7 — for people expressing a need your product solves.',
  },
  {
    icon: Activity,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.09)',
    title: 'Two-Stage AI Matching',
    desc: 'Every signal is scored 0–100 by Claude AI. Only high-confidence matches (65+) trigger any action.',
  },
  {
    icon: Zap,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.09)',
    title: 'Autonomous Distribution',
    desc: '5 modules execute automatically: AI replies, SEO articles, GEO optimisation, personalised outreach, landing pages.',
  },
]

const STATS = [
  { val: '1,289', label: 'Signals Detected',  color: '#8b5cf6' },
  { val: '342',   label: 'Actions Executed',   color: '#06b6d4' },
  { val: '158',   label: 'Leads Generated',    color: '#10b981' },
  { val: '94%',   label: 'Content Pass Rate',  color: '#f59e0b' },
]

const BULLETS = [
  'Works while you sleep — fully autonomous',
  'Nigerian-context AI — understands your market',
  'Zero templates — every response generated fresh',
  'NDPR/GDPR compliant by design',
]

export default function Landing({ onGetStarted, onSignIn }) {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'inherit', overflowX: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(ellipse, rgba(109,40,217,0.15) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(6,182,212,0.09) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(139,92,246,0.4)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg,#c4b5fd,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px' }}>OUTRIQ</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onSignIn} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, transition: 'color 180ms' }}
            onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.5)'}>
            Sign In
          </button>
          <button onClick={onGetStarted} className="btn btn-primary" style={{ fontSize: 13, padding: '8px 20px' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '96px 24px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>AI Engine Active — Monitoring 8 Platforms</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px,6vw,72px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
          Find Your Customers{' '}
          <span style={{ background: 'linear-gradient(135deg,#c4b5fd,#67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Before They Find
          </span>
          {' '}Your Competitors
        </h1>

        <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
          OUTRIQ monitors social platforms, detects purchase intent in real-time, and automatically executes personalised marketing — 24 hours a day, 7 days a week.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onGetStarted} className="btn btn-primary" style={{ fontSize: 15, padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
            Start Free <ArrowRight size={15} />
          </button>
          <button onClick={onSignIn} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: 10, cursor: 'pointer', fontSize: 15, padding: '14px 32px', fontWeight: 600, transition: 'background 180ms' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
            Sign In
          </button>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -1.5, marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, letterSpacing: '-1px' }}>Three Stages. Fully Automatic.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px 24px', borderTop: `2px solid ${f.color}40` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px' }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Built-in benefits */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 96px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 36px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, letterSpacing: '-0.5px' }}>Everything You Need. Nothing You Don't.</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginBottom: 36 }}>
            {BULLETS.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>{b}</span>
              </div>
            ))}
          </div>
          <button onClick={onGetStarted} className="btn btn-primary" style={{ fontSize: 14, padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Launch Your Engine <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>OUTRIQ</span>
        </div>
        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)' }}>Autonomous AI Marketing Engine · {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
