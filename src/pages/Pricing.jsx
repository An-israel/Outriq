import { Check, X, Zap, Star } from 'lucide-react'

const TIERS = [
  {
    id: 'free', name: 'Free', price: 0, naira: '₦0', products: '1 product',
    desc: 'Test the system. Get your first product in front of real customers — zero ad spend.',
    color: 'var(--text-3)',
    features: [
      { text: '1 product registered', on: true },
      { text: 'SEO content generation', on: true },
      { text: '1 topical content site', on: true },
      { text: 'Auto-generated landing page', on: true },
      { text: 'Basic analytics', on: true },
      { text: 'Social monitoring', on: false },
      { text: 'Conversational responses', on: false },
      { text: 'Email outreach', on: false },
      { text: 'GEO optimisation', on: false },
      { text: 'API access', on: false },
    ],
    cta: 'Start Free', ctaClass: 'btn-secondary',
  },
  {
    id: 'starter', name: 'Starter', price: 15, naira: '₦25,000', products: '3 products',
    desc: 'For early businesses wanting AI-powered reach across key platforms.',
    color: 'var(--cyan-400)',
    features: [
      { text: '3 products registered', on: true },
      { text: 'All Free features', on: true },
      { text: 'Social monitoring (2 platforms)', on: true },
      { text: 'Conversational responses', on: true },
      { text: 'Weekly performance report', on: true },
      { text: '5 SEO articles / week / product', on: true },
      { text: 'Email outreach', on: false },
      { text: 'GEO optimisation', on: false },
      { text: 'All platform monitoring', on: false },
      { text: 'API access', on: false },
    ],
    cta: 'Get Started', ctaClass: 'btn-secondary',
  },
  {
    id: 'growth', name: 'Growth', price: 40, naira: '₦65,000', products: '10 products',
    desc: 'Serious growth across all 8 channels with outreach and daily intelligence.',
    color: 'var(--violet-400)',
    featured: true, badge: 'Most Popular',
    features: [
      { text: '10 products registered', on: true },
      { text: 'All Starter features', on: true },
      { text: 'All platform monitoring (8)', on: true },
      { text: 'Email outreach (20 msgs/day)', on: true },
      { text: 'GEO optimisation', on: true },
      { text: 'Daily performance updates', on: true },
      { text: 'Priority matching algorithm', on: true },
      { text: 'Nairaland + Reddit monitoring', on: true },
      { text: 'API access', on: false },
      { text: 'White-label pages', on: false },
    ],
    cta: 'Upgrade to Growth', ctaClass: 'btn-primary',
  },
  {
    id: 'pro', name: 'Pro', price: 100, naira: '₦165,000', products: 'Unlimited',
    desc: 'Full capability. API access, white-label, dedicated support, advanced analytics.',
    color: 'var(--amber-400)',
    features: [
      { text: 'Unlimited products', on: true },
      { text: 'All Growth features', on: true },
      { text: 'API access for integrations', on: true },
      { text: 'Custom content sites', on: true },
      { text: 'White-label landing pages', on: true },
      { text: 'Dedicated support', on: true },
      { text: 'Advanced analytics', on: true },
      { text: 'Agency white-labeling', on: true },
      { text: 'SLA uptime guarantee', on: true },
      { text: 'Onboarding call included', on: true },
    ],
    cta: 'Go Pro', ctaClass: 'btn-secondary',
  },
]

const COMPARE = [
  { feature: 'Products', free: '1', starter: '3', growth: '10', pro: 'Unlimited' },
  { feature: 'Platform Monitoring', free: '—', starter: '2', growth: '8', pro: '8+' },
  { feature: 'SEO Articles / week', free: '2', starter: '5/product', growth: '10/product', pro: 'Unlimited' },
  { feature: 'Conversational Responses', free: '—', starter: '✓', growth: '✓', pro: '✓' },
  { feature: 'Email Outreach / day', free: '—', starter: '—', growth: '20/product', pro: '50/product' },
  { feature: 'GEO Optimisation', free: '—', starter: '—', growth: '✓', pro: '✓' },
  { feature: 'Analytics', free: 'Basic', starter: 'Weekly', growth: 'Daily', pro: 'Advanced' },
  { feature: 'API Access', free: '—', starter: '—', growth: '—', pro: '✓' },
  { feature: 'Support', free: 'Community', starter: 'Email', growth: 'Priority', pro: 'Dedicated' },
]

export default function Pricing() {
  return (
    <>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 100, padding: '5px 14px', fontSize: 10.5, fontWeight: 700, color: 'var(--violet-300)', marginBottom: 14, letterSpacing: '1px', textTransform: 'uppercase' }}>
          <Star size={10} /> Simple, Transparent Pricing
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: 'var(--text-1)', letterSpacing: -2, lineHeight: 1.05, marginBottom: 14 }}>
          No Ad Budget Required
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 480, margin: '0 auto 0', lineHeight: 1.65 }}>
          Enter your product. OUTRIQ finds your customers autonomously. Pay for compute and API usage — a fraction of traditional ad spend.
        </p>
      </div>

      {/* Pricing grid */}
      <div className="pricing-grid">
        {TIERS.map(t => (
          <div key={t.id} className={`pricing-card ${t.featured ? 'featured' : ''}`}>
            {t.badge && <div className="pricing-badge">{t.badge}</div>}

            <div className="pricing-tier-name" style={{ color: t.color }}>{t.name}</div>

            <div className="pricing-price">
              <span className="pricing-currency">$</span>
              <span className="pricing-amount" style={{ color: t.featured ? t.color : 'var(--text-1)' }}>{t.price}</span>
            </div>
            <div className="pricing-period">/month</div>
            <div className="pricing-naira">{t.naira}/month</div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `rgba(255,255,255,0.05)`, border: '1px solid var(--border-1)', borderRadius: 100, padding: '3px 10px', fontSize: 10.5, fontWeight: 700, color: t.color, marginBottom: 14 }}>
              <Zap size={9} /> {t.products}
            </div>

            <div className="pricing-desc">{t.desc}</div>

            <ul className="pricing-features">
              {t.features.map((f, i) => (
                <li key={i} className={`pricing-feature ${f.on ? '' : 'disabled'}`}>
                  {f.on
                    ? <Check size={12} style={{ color: 'var(--green-400)', flexShrink: 0 }} />
                    : <X size={12} style={{ color: 'var(--text-4)', flexShrink: 0 }} />
                  }
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <button className={`btn ${t.ctaClass} w-full`}>{t.cta}</button>
          </div>
        ))}
      </div>

      {/* Revenue streams */}
      <div style={{ marginTop: 52 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 8 }}>Additional Revenue Streams</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.5 }}>More Ways to Earn with OUTRIQ</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { emoji: '🎯', title: 'Pay-Per-Lead', desc: 'Optional add-on: pay per qualified lead generated. Aligns incentives — we only earn more when you do.' },
            { emoji: '📝', title: 'Content Marketplace', desc: 'Purchase additional SEO articles or landing page variants beyond your tier.' },
            { emoji: '🔌', title: 'API Access', desc: 'Let developers integrate the matching engine into their own tools for a monthly API fee.' },
            { emoji: '🏢', title: 'Enterprise / White-label', desc: 'Custom white-label deployments for agencies wanting to offer AI marketing to their own clients.' },
          ].map(s => (
            <div key={s.title} className="card">
              <div style={{ fontSize: 26, marginBottom: 12 }}>{s.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 7, letterSpacing: -0.2 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature comparison */}
      <div style={{ marginTop: 52 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.5 }}>Full Feature Comparison</div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Feature</th>
                {TIERS.map(t => (
                  <th key={t.id} style={{ textAlign: 'center', color: t.featured ? t.color : 'var(--text-4)' }}>{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(row => (
                <tr key={row.feature}>
                  <td style={{ fontWeight: 500, color: 'var(--text-2)' }}>{row.feature}</td>
                  {['free', 'starter', 'growth', 'pro'].map(k => (
                    <td key={k} style={{ textAlign: 'center', color: row[k] === '✓' ? 'var(--green-400)' : row[k] === '—' ? 'var(--text-4)' : 'var(--text-1)', fontFamily: /^\d|Unlimited|Basic|Weekly|Daily|Advanced|Email|Community|Priority|Dedicated/.test(row[k]) ? 'var(--font-mono)' : 'inherit', fontWeight: row[k] === '✓' ? 800 : 500, fontSize: row[k] === '✓' ? 15 : 12.5 }}>
                      {row[k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: 56, textAlign: 'center', padding: '48px 20px', background: 'linear-gradient(135deg, rgba(109,40,217,0.1) 0%, rgba(6,182,212,0.06) 100%)', borderRadius: 28, border: '1px solid rgba(139,92,246,0.2)', boxShadow: 'var(--glow-violet)' }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', letterSpacing: -1.5, marginBottom: 12, lineHeight: 1.1 }}>
          Ready to let AI market your business?
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-3)', marginBottom: 28, maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Enter your product once. OUTRIQ finds customers, generates content, responds to intent signals — 24/7, autonomously.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <button className="btn btn-secondary btn-lg">View Demo</button>
          <button className="btn btn-primary btn-lg">
            <Zap size={16} /> Start for Free
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
          No credit card required · No ad budget needed · Cancel any time
        </div>
      </div>
    </>
  )
}
