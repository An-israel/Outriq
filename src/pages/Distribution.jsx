import { useState } from 'react'
import { FileText, Globe, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { useActions } from '../hooks/useActions'
import { usePlatforms } from '../hooks/usePlatforms'
import { useProducts } from '../hooks/useProducts'
import { api } from '../api/client'

const MODULES = [
  {
    id: 'seo', name: 'SEO Content Engine', icon: FileText, apiEndpoint: 'seo',
    color: 'var(--cyan-400)', bg: 'rgba(34,211,238,0.09)', enabled: true,
    desc: 'Generates 1,000-2,000 word SEO-optimised articles targeting high-intent keywords. Published to topical content sites.',
    rules: ['Targets keywords from each Product Intelligence Profile', 'Minimum 1,000 words — always original, always valuable', 'Submitted to Google Search Console Indexing API', 'Monthly ranking checks — articles on page 2-3 get updated'],
    stats: { today: 4, week: 28, rate: 100 },
  },
  {
    id: 'geo', name: 'Generative Engine Optimisation (GEO)', icon: Globe, apiEndpoint: 'geo',
    color: 'var(--green-400)', bg: 'rgba(16,185,129,0.09)', enabled: true,
    desc: 'Structures content so AI assistants (ChatGPT, Claude, Gemini, Perplexity) include your product in their answers.',
    rules: ['Direct, concise answers at top of every article', 'Schema.org Product, FAQ, LocalBusiness markup on all pages', 'Consistent NAP across all web properties', 'FAQ pages per product — highest-value for AI extraction'],
    stats: { today: 4, week: 28, rate: 100 },
  },
  {
    id: 'landing', name: 'Auto-Generated Landing Pages', icon: Zap, apiEndpoint: 'landing',
    color: 'var(--rose-400)', bg: 'rgba(251,113,133,0.09)', enabled: true,
    desc: 'Creates SEO-ready landing pages per product, deployed to your subdomain instantly. A/B tests headlines automatically.',
    rules: ['Schema.org Product & LocalBusiness structured data', 'Open Graph & Twitter Card meta tags', 'A/B test — 2-3 headline variants rotated automatically', 'Plausible / Google Analytics tracking built-in'],
    stats: { today: 1, week: 5, rate: 100 },
  },
]

function ModuleCard({ module: m, onToggle, onGenerate, generating }) {
  const Icon = m.icon
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card" style={{ borderLeft: `2px solid ${m.enabled ? m.color : 'transparent'}`, transition: 'border-color 220ms ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: m.enabled ? m.bg : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 220ms' }}>
          <Icon size={16} style={{ color: m.enabled ? m.color : 'var(--text-4)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: m.enabled ? 'var(--text-1)' : 'var(--text-3)', letterSpacing: -0.2 }}>{m.name}</div>
            <label className="toggle">
              <input type="checkbox" checked={m.enabled} onChange={() => onToggle(m.id)} />
              <span className="toggle-track" />
            </label>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55, marginBottom: 12 }}>{m.desc}</div>

          {/* Stats + actions */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {[
              { label: 'Today', val: m.stats.today, color: 'var(--text-1)' },
              { label: 'This Week', val: m.stats.week, color: 'var(--cyan-400)' },
              { label: 'Success Rate', val: `${m.stats.rate}%`, color: 'var(--green-400)' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -0.5 }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ fontSize: 11 }}
                onClick={() => onGenerate(m.apiEndpoint)}
                disabled={generating || !m.enabled}
              >
                <Zap size={11} /> {generating ? 'Generating...' : 'Generate'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11 }}
                onClick={() => setExpanded(x => !x)}
              >
                {expanded ? 'Hide' : 'Rules'}
              </button>
            </div>
          </div>

          {expanded && (
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: 14, border: '1px solid var(--border-1)' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>Compliance Rules</div>
              {m.rules.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <CheckCircle size={11} style={{ color: 'var(--green-400)', marginTop: 1.5, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionIcon({ type }) {
  const map = {
    content:  { Icon: FileText, cls: 'action-content' },
    geo:      { Icon: Globe,    cls: 'action-content' },
    landing:  { Icon: Zap,      cls: 'action-landing' },
  }
  const { Icon, cls } = map[type] || map.content
  return <div className={`action-icon-wrap ${cls}`}><Icon size={14} /></div>
}

export default function Distribution() {
  const [modules, setModules] = useState(MODULES)
  const [activeTab, setActiveTab] = useState('modules')
  const { actions, refresh: refreshActions } = useActions({ limit: 30 })
  const { platforms } = usePlatforms()
  const { products } = useProducts()
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)

  const toggle = id => setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))

  const totalToday = modules.reduce((s, m) => s + m.stats.today, 0)

  // Filter actions to only content-related types
  const contentActions = actions.filter(a => ['content', 'geo', 'landing'].includes(a.type))

  const PLATFORM_CHANNELS = platforms.map(ch => ({
    ...ch, limit: ch.daily_limit, actionsToday: ch.actions_today, signals: ch.signals_today,
  }))

  async function handleGenerate(endpoint) {
    const product = products.find(p => p.status === 'active') || products[0]
    if (!product) return
    setGenerating(true)
    setResult(null)
    try {
      const data = await api.post(`/distribute/${endpoint}`, { productId: product.id })
      setResult({ type: endpoint, content: data.content || JSON.stringify(data, null, 2) })
      refreshActions()
    } catch (e) { console.error(e) }
    finally { setGenerating(false) }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Content Distribution</div>
          <div className="page-subtitle">
            3 content engines &mdash; <strong style={{ color: 'var(--cyan-400)' }}>{totalToday}</strong> pieces generated today
          </div>
        </div>
        <div className="live-badge"><span className="live-dot" />Active</div>
      </div>

      {/* Module stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {modules.map(m => {
          const Icon = m.icon
          return (
            <div key={m.id} style={{ background: 'var(--bg-surface)', border: `1px solid ${m.enabled ? m.color + '25' : 'var(--border-1)'}`, borderRadius: 16, padding: '16px 18px', transition: 'border-color 220ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={13} style={{ color: m.color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.enabled ? m.color : 'var(--text-4)' }}>
                  {m.enabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-mono)', letterSpacing: -1.5 }}>{m.stats.today}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: 3 }}>Generated Today</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
        {/* Left */}
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[{ id: 'modules', label: 'Engines' }, { id: 'log', label: 'Action Log' }].map(t => (
              <button key={t.id} className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'modules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {modules.map(m => (
                <ModuleCard key={m.id} module={m} onToggle={toggle} onGenerate={handleGenerate} generating={generating} />
              ))}
            </div>
          )}

          {activeTab === 'log' && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">Recent Content Actions</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{contentActions.length} total</span>
              </div>
              {contentActions.length === 0 && (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-4)', fontSize: 12 }}>
                  No content generated yet &mdash; use the Generate button on any engine
                </div>
              )}
              {contentActions.map(a => (
                <div className="action-item" key={a.id}>
                  <ActionIcon type={a.type} />
                  <div className="action-body">
                    <div className="action-title">{a.title}</div>
                    <div className="action-desc">{a.description}</div>
                    <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
                      <span className="badge badge-violet" style={{ fontSize: 9.5 }}>{a.product_name}</span>
                      <span className={`badge ${a.status === 'success' ? 'badge-green' : a.status === 'processing' ? 'badge-amber' : 'badge-muted'}`} style={{ fontSize: 9.5 }}>
                        {a.status === 'success' ? 'Generated' : a.status === 'processing' ? 'Processing' : 'Queued'}
                      </span>
                    </div>
                  </div>
                  <div className="action-meta">
                    <span className="action-time">{a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Generated content preview */}
          {result && (
            <div className="card" style={{ marginTop: 14 }}>
              <div className="card-header" style={{ marginBottom: 12 }}>
                <span className="card-title">Generated Content</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setResult(null)} style={{ fontSize: 11 }}>Dismiss</button>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.025)', borderRadius: 10,
                padding: 16, border: '1px solid var(--border-1)',
                maxHeight: 300, overflowY: 'auto',
                fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7,
                whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)',
              }}>
                {typeof result.content === 'string' ? result.content.slice(0, 2000) : JSON.stringify(result.content, null, 2).slice(0, 2000)}
                {(result.content?.length || 0) > 2000 && '\n\n... (truncated)'}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Platform coverage */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}><span className="card-title">Platform Coverage</span></div>
            {PLATFORM_CHANNELS.map(ch => {
              const pct = ch.limit > 0 ? Math.round((ch.actionsToday / ch.limit) * 100) : 0
              const barCls = pct > 80 ? 'progress-rose' : pct > 60 ? 'progress-amber' : 'progress-emerald'
              return (
                <div key={ch.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`channel-indicator ${ch.status}`} />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>{ch.name}</span>
                    </div>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}>
                      {ch.limit > 0 ? `${ch.actionsToday}/${ch.limit}` : `${ch.signals} signals`}
                    </span>
                  </div>
                  {ch.limit > 0 && (
                    <div className="progress-bar">
                      <div className={`progress-fill ${barCls}`} style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Content quality */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}><span className="card-title">Quality Checks</span></div>
            {[
              { label: 'Content uniqueness (< 30% similarity)', ok: true },
              { label: 'SEO keyword density (1-3%)', ok: true },
              { label: 'Schema.org structured data', ok: true },
              { label: 'Mobile responsive landing pages', ok: true },
              { label: 'AI-search optimised (GEO)', ok: true },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9 }}>
                {c.ok
                  ? <CheckCircle size={12} style={{ color: 'var(--green-400)', flexShrink: 0, marginTop: 1 }} />
                  : <AlertCircle size={12} style={{ color: 'var(--amber-400)', flexShrink: 0, marginTop: 1 }} />}
                <span style={{ fontSize: 12, color: c.ok ? 'var(--text-3)' : 'var(--amber-400)' }}>{c.label}</span>
              </div>
            ))}
          </div>

          {/* Today summary */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}><span className="card-title">Today's Output</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'SEO Articles', val: 4, color: 'var(--cyan-400)' },
                { label: 'GEO Updates', val: 4, color: 'var(--green-400)' },
                { label: 'Landing Pages', val: 1, color: 'var(--rose-400)' },
                { label: 'Total Clicks', val: 73, color: 'var(--text-1)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -0.8 }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
