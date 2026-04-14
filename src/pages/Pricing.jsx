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
    color: 'var(--accent)',
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
    color: 'var(--accent)',
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
    color: 'var(--text-2)',
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

export default function Pricing() {
  return (
    <>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(207,108,79,0.08)', border: '1px solid rgba(207,108,79,0.2)', borderRadius: 100, padding: '5px 14px', fontSize: 10.5, fontWeight: 700, color: 'var(--accent)', marginBottom: 14, letterSpacing: '1px', textTransform: 'uppercase' }}>
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

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-1)', borderRadius: 100, padding: '3px 10px', fontSize: 10.5, fontWeight: 700, color: t.color, marginBottom: 14 }}>
              <Zap size={9} /> {t.products}
            </div>

            <div className="pricing-desc">{t.desc}</div>

            <ul className="pricing-features">
              {t.features.map((f, i) => (
                <li key={i} className={`pricing-feature ${f.on ? '' : 'disabled'}`}>
                  {f.on
                    ? <Check size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
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
    </>
  )
}
