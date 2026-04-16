import { useState } from 'react'
import { Plus, Search, MapPin, Globe, Tag, Users, Check, CheckCircle, X, ChevronRight, Zap, Brain } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'

const CATEGORIES = [
  'SaaS / Software', 'Fintech', 'Agritech', 'Crypto & DeFi', 'E-commerce',
  'Education & EdTech', 'Health & Fitness', 'Food & Beverage', 'Legal Services',
  'Real Estate', 'Logistics & Delivery', 'Media & Entertainment', 'Fashion & Beauty',
  'Travel & Hospitality', 'Business Services', 'Marketing & Advertising',
  'HR & Recruitment', 'Insurance', 'Energy & Utilities', 'Non-profit / NGO', 'Other',
]

function PIPTag({ text }) {
  return <span className="pip-tag">{text}</span>
}

function ProductModal({ product: p, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={13} /></button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `${p.color}15`, border: `1px solid ${p.color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>
            {p.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.4 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{p.status}</span>
              <span className="badge badge-muted">{p.category}</span>
              <span className="badge badge-muted">{p.location}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: p.matchScore >= 85 ? 'var(--green-400)' : 'var(--amber-400)', fontFamily: 'var(--font-mono)', letterSpacing: -2, lineHeight: 1 }}>{p.matchScore}</div>
            <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 4, fontWeight: 700 }}>AI Match Score</div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 22 }}>
          {[
            { label: 'Signals', val: p.metrics.signals, color: 'var(--cyan-400)' },
            { label: 'Actions', val: p.metrics.actions, color: 'var(--violet-400)' },
            { label: 'Leads', val: p.metrics.leads, color: 'var(--green-400)' },
            { label: 'Impressions', val: p.metrics.impressions.toLocaleString(), color: 'var(--amber-400)' },
            { label: 'Clicks', val: p.metrics.clicks.toLocaleString(), color: 'var(--text-1)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: 'var(--font-mono)', letterSpacing: -0.5 }}>{m.val}</div>
              <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 3, fontWeight: 700 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 7 }}>Description</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: '11px 14px', border: '1px solid var(--border-1)' }}>
            {p.description}
          </div>
        </div>

        {/* PIP */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>Product Intelligence Profile</div>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-1)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan-400)', marginBottom: 5 }}>Value Proposition</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14 }}>{p.pip.valueProp}</div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--violet-300)', marginBottom: 6 }}>Pain Points Solved</div>
            <div style={{ marginBottom: 14 }}>
              {p.pip.painPoints.map(pt => (
                <div key={pt} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 4 }}>
                  <CheckCircle size={11} style={{ color: 'var(--green-400)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{pt}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber-400)', marginBottom: 7 }}>Search Terms</div>
            <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap' }}>
              {p.pip.searchTerms.map(t => <PIPTag key={t} text={t} />)}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 7 }}>Active Platforms</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {p.pip.platforms.map(pl => <PIPTag key={pl} text={pl} />)}
            </div>
          </div>
        </div>

        {p.website && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cyan-400)' }}>
            <Globe size={12} /> {p.website}
          </div>
        )}
      </div>
    </div>
  )
}

function AddProductModal({ onClose, onCreate }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', description: '', targetCustomer: '', location: '', category: '', website: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onCreate({
        name: form.name,
        description: form.description,
        target_customer: form.targetCustomer,
        location: form.location,
        category: form.category,
        website: form.website,
      })
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1.5px solid var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'var(--glow-green)' }}>
          <CheckCircle size={28} style={{ color: 'var(--green-400)' }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8, letterSpacing: -0.4 }}>Product Launched</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--violet-400)' }}>{form.name || 'Your product'}</strong> is queued for processing.
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 26, lineHeight: 1.6 }}>
          OUTRIQ will generate the Product Intelligence Profile, set up vector embeddings, and begin monitoring {form.location || 'your target market'} for intent signals within 2 minutes.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={onClose}>View Dashboard</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 540 }}>
        <button className="modal-close" onClick={onClose}><X size={13} /></button>
        <div className="modal-title">Add New Product</div>
        <div className="modal-sub">Enter your product details once. OUTRIQ handles everything else — finding customers autonomously 24/7.</div>

        <div className="step-progress">
          {['Product Info', 'Target Market', 'Review'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div className={`step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
                <div className="step-circle">
                  {step > i + 1 ? <Check size={11} /> : i + 1}
                </div>
                <span className="step-label">{label}</span>
              </div>
              {i < 2 && <div className={`step-connector ${step > i + 1 ? 'done' : ''}`} style={{ flex: 1 }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Product / Service Name <span>*</span></label>
                <input className="form-input" placeholder="e.g. ChopFit Lagos" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Category <span>*</span></label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Product Description <span>*</span></label>
              <textarea className="form-textarea" placeholder="Describe what your product does, the problem it solves, and what makes it unique. The more detail you give OUTRIQ, the better it markets for you. (max 500 words)" value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight: 110 }} />
              <div className="form-hint">This is the AI's primary input for generating your Product Intelligence Profile.</div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-3)' }}>Website URL <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>(optional)</span></label>
              <input className="form-input" placeholder="www.yourwebsite.com" value={form.website} onChange={e => set('website', e.target.value)} />
              <div className="form-hint">OUTRIQ will crawl up to 10 pages for additional product context.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={() => setStep(2)} disabled={!form.name || !form.category || !form.description}>
                Next <ChevronRight size={13} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label className="form-label">Target Customer <span>*</span></label>
              <input className="form-input" placeholder="e.g. Health-conscious professionals aged 25–40 in Lagos" value={form.targetCustomer} onChange={e => set('targetCustomer', e.target.value)} />
              <div className="form-hint">Age range, location, occupation, lifestyle. The more specific, the better the targeting.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Location / Service Area <span>*</span></label>
              <input className="form-input" placeholder="e.g. New York, USA  or  London, UK  or  Worldwide" value={form.location} onChange={e => set('location', e.target.value)} />
              <div className="form-hint">City, country, region, or "Worldwide" / "Remote"</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary btn-sm" onClick={() => setStep(3)} disabled={!form.targetCustomer || !form.location}>
                Review <ChevronRight size={13} />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-2)', borderRadius: 14, padding: 18, marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 14 }}>Review Details</div>
              {[
                { icon: <Tag size={12} />, label: 'Product', value: form.name },
                { icon: <Tag size={12} />, label: 'Category', value: form.category },
                { icon: <MapPin size={12} />, label: 'Location', value: form.location },
                { icon: <Users size={12} />, label: 'Target', value: form.targetCustomer },
                { icon: <Globe size={12} />, label: 'Website', value: form.website || '—' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet-400)', flexShrink: 0 }}>
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 1 }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 12, marginBottom: 14 }}>{error}</div>}

            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--green-400)', display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.6 }}>
              <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>OUTRIQ will begin autonomous marketing of this product within 2 minutes. No ad budget required.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting} style={{ fontWeight: 700 }}>
                {submitting
                  ? <><svg className="spinning" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Processing…</>
                  : <><Zap size={14} /> Launch AI Marketing</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product: p, onClick }) {
  return (
    <div className={`product-card ${p.status === 'active' ? 'active-card' : 'paused-card'}`} onClick={onClick}>
      <div className="product-card-header">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${p.color}15`, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {p.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="product-name">{p.name}</div>
          <div className="product-category">{p.category}</div>
        </div>
        <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{p.status}</span>
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={9} style={{ flexShrink: 0 }} /> {p.location}
      </div>

      {/* Match score */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 9.5, color: 'var(--text-4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Match Score</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: p.matchScore >= 85 ? 'var(--green-400)' : 'var(--amber-400)', fontFamily: 'var(--font-mono)' }}>{p.matchScore}/100</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill progress-purple" style={{ width: `${p.matchScore}%` }} />
        </div>
      </div>

      <div className="product-metrics">
        <div>
          <div className="product-metric-val" style={{ color: 'var(--cyan-400)' }}>{p.metrics.signals}</div>
          <div className="product-metric-label">Signals</div>
        </div>
        <div>
          <div className="product-metric-val" style={{ color: 'var(--violet-400)' }}>{p.metrics.actions}</div>
          <div className="product-metric-label">Actions</div>
        </div>
        <div>
          <div className="product-metric-val" style={{ color: 'var(--green-400)' }}>{p.metrics.leads}</div>
          <div className="product-metric-label">Leads</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 5, marginTop: 14, flexWrap: 'wrap' }}>
        {p.pip.platforms.slice(0, 3).map(pl => (
          <span key={pl} className="badge badge-muted" style={{ fontSize: 9.5 }}>{pl}</span>
        ))}
        {p.pip.platforms.length > 3 && (
          <span className="badge badge-muted" style={{ fontSize: 9.5 }}>+{p.pip.platforms.length - 3}</span>
        )}
      </div>
    </div>
  )
}

export default function Products({ onNavigate }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const { products: rawProducts, createProduct, updateProduct } = useProducts()

  // Normalise API shape to match what ProductCard expects
  const PRODUCTS = rawProducts.map(p => ({
    ...p,
    matchScore: p.match_score || 0,
    pip: p.pip_json || { platforms: [], painPoints: [], searchTerms: [], valueProp: '' },
    metrics: { signals: p.signals_count || 0, actions: p.actions_count || 0, leads: p.leads_count || 0, impressions: p.impressions || 0, clicks: p.clicks || 0 },
  }))

  const filtered = PRODUCTS.filter(p => {
    const q = search.toLowerCase()
    return (filter === 'all' || p.status === filter) &&
      (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))
  })

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">Manage registered products and their AI marketing profiles</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
          <Search size={13} style={{ color: 'var(--text-4)' }} />
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'active', 'paused'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
        {[
          { label: 'Total Products', val: PRODUCTS.length, color: 'var(--text-1)' },
          { label: 'Active', val: PRODUCTS.filter(p => p.status === 'active').length, color: 'var(--green-400)' },
          { label: 'Total Signals', val: PRODUCTS.reduce((s, p) => s + (p.metrics?.signals || 0), 0).toLocaleString(), color: 'var(--cyan-400)' },
          { label: 'Total Leads', val: PRODUCTS.reduce((s, p) => s + (p.metrics?.leads || 0), 0), color: 'var(--violet-400)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-1)', borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -1 }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* First-time empty state — user has no products at all */}
      {PRODUCTS.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Zap size={32} style={{ color: 'var(--violet-400)' }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: -0.5, marginBottom: 10 }}>Launch your first product</div>
          <div style={{ fontSize: 14, color: 'var(--text-4)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 28px' }}>
            Add a product and OUTRIQ will automatically build its AI profile, monitor 8 platforms for buyers, and start marketing it — all without ad spend.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { icon: Brain, text: 'AI Intelligence Profile generated' },
              { icon: Search, text: 'Intent signals detected 24/7' },
              { icon: Zap, text: 'Autonomous marketing executed' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-1)', borderRadius: 8, padding: '7px 14px', fontSize: 12, color: 'var(--text-3)' }}>
                <Icon size={12} style={{ color: 'var(--violet-400)' }} /> {text}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ fontSize: 14, padding: '12px 28px' }} onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Your First Product
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Package size={24} /></div>
          <div className="empty-title">No products match</div>
          <div className="empty-desc">Try adjusting your search or filters.</div>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />)}
          {/* Add new */}
          <div
            onClick={() => setShowAdd(true)}
            style={{ background: 'rgba(255,255,255,0.015)', backdropFilter: 'blur(20px)', border: '1px dashed var(--border-2)', borderRadius: 'var(--r-xl)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, cursor: 'pointer', transition: 'all 220ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.05)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
          >
            <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1px dashed var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: 'var(--text-4)' }}>
              <Plus size={16} />
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-4)' }}>Add New Product</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3, opacity: 0.6 }}>OUTRIQ handles the rest</div>
          </div>
        </div>
      )}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onCreate={createProduct} />}
    </>
  )
}
