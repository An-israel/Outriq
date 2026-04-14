import { useState } from 'react'
import { Brain, RefreshCw, CheckCircle, Zap } from 'lucide-react'
import { useSignals } from '../hooks/useSignals'
import { useProducts } from '../hooks/useProducts'
import { api } from '../api/client'

function PlatformIcon({ pKey, platform }) {
  return <div className={`signal-platform-icon platform-${platform}`}>{pKey}</div>
}

function TypePill({ type }) {
  return <span className={`signal-type-pill type-${type}`}>{type}</span>
}

function SignalDetail({ signal, onClose, onSimulate, products }) {
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState(null)
  const product = products.find(p => p.id === signal.product_id)

  async function executeAction() {
    setExecuting(true)
    try {
      const data = await api.post(`/signals/${signal.id}/act`, { type: 'respond' })
      setResult(data)
    } catch (e) { console.error(e) }
    finally { setExecuting(false) }
  }
  return (
    <div style={{
      background: 'rgba(255,255,255,0.035)',
      backdropFilter: 'blur(24px)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--r-xl)',
      padding: 22,
      boxShadow: 'var(--glow-violet)',
      position: 'relative',
    }}>
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-1)', borderRadius: 8, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)' }}
      >×</button>

      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 14 }}>Signal Analysis</div>

      <PlatformIcon pKey={signal.platformKey} platform={signal.platform} />
      <div style={{ fontSize: 10, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.9px', marginTop: 10, marginBottom: 5 }}>{signal.platformLabel}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 18, fontStyle: 'italic' }}>
        "{signal.text}"
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Match Score', val: signal.score, color: signal.score >= 85 ? 'var(--green-400)' : 'var(--amber-400)' },
          { label: 'Signal Type', val: signal.signalType, color: 'var(--violet-300)', isText: true },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', textAlign: 'center', border: '1px solid var(--border-1)' }}>
            <div style={{ fontSize: s.isText ? 14 : 24, fontWeight: 800, color: s.color, fontFamily: s.isText ? 'inherit' : 'var(--font-mono)', letterSpacing: s.isText ? 0 : -0.5, textTransform: s.isText ? 'capitalize' : 'none' }}>{s.val}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4, fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {product && (
        <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 12, padding: 12, border: '1px solid var(--border-1)', marginBottom: 14 }}>
          <div style={{ fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>Matched Product</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 22 }}>{product.emoji}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{product.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{product.category} · {product.location}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--violet-300)', lineHeight: 1.55, marginBottom: 14 }}>
        Post a helpful, natural recommendation on {signal.platform_label}. Use platform-specific tone — Nigerian English for Nairaland, professional for LinkedIn. Quality filter score must exceed 80/100.
      </div>

      {result && (
        <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--green-400)', marginBottom: 14, lineHeight: 1.6 }}>
          <CheckCircle size={11} style={{ display: 'inline', marginRight: 5 }} />
          Action queued — Claude is generating the response...
        </div>
      )}

      <button className="btn btn-primary w-full btn-sm" onClick={executeAction} disabled={executing || !!result}>
        <Brain size={13} /> {executing ? 'Generating...' : result ? 'Action Queued ✓' : 'Execute Action'}
      </button>
    </div>
  )
}

export default function Intelligence() {
  const { signals, live, refresh, simulateSignals } = useSignals({ limit: 30 })
  const { products } = useProducts()
  const [selected, setSelected] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [simulating, setSimulating] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setIsRefreshing(false)
  }

  const handleSimulate = async () => {
    if (!products.length) return
    setSimulating(true)
    const pid = products.find(p => p.status === 'active')?.id || products[0].id
    await simulateSignals(pid, 5)
    setSimulating(false)
  }

  const filtered = signals.filter(s => filterType === 'all' || s.signal_type === filterType)
  const avgScore = signals.length ? Math.round(signals.reduce((a, s) => a + s.score, 0) / signals.length) : 0
  const highConf = signals.filter(s => s.score >= 85).length

  const typeCounts = ['question', 'need', 'complaint', 'search'].map(t => ({
    type: t,
    count: signals.filter(s => s.signal_type === t).length,
    pct: signals.length ? Math.round((signals.filter(s => s.signal_type === t).length / signals.length) * 100) : 0,
  }))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Intelligence Engine</div>
          <div className="page-subtitle">Real-time intent signal detection across 7 active platforms</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="live-badge"><span className="live-dot" />{live ? 'NEW SIGNAL' : 'Monitoring'}</div>
          <button className="btn btn-secondary btn-sm" onClick={handleSimulate} disabled={simulating}>
            <Zap size={12} /> {simulating ? 'Generating...' : 'Generate Signals'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh}>
            <RefreshCw size={12} className={isRefreshing ? 'spinning' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Signals Detected', val: signals.length, color: 'var(--cyan-400)' },
          { label: 'Avg Match Score',  val: `${avgScore}`, color: 'var(--green-400)' },
          { label: 'High Confidence',  val: highConf, color: 'var(--violet-400)' },
          { label: 'Pending Action',   val: signals.filter(s => s.score >= 80).length, color: 'var(--amber-400)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -2, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="intel-grid">
        {/* Left: signal feed */}
        <div>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {['all', 'question', 'need', 'complaint', 'search'].map(t => (
              <button
                key={t}
                className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterType(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} signals
            </span>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="card-title">Detected Signals</span>
              <div className="live-badge"><span className="live-dot" />Live</div>
            </div>
            <div style={{ maxHeight: 520, overflowY: 'auto', padding: 10 }}>
              <div className="signal-feed" style={{ maxHeight: 'none' }}>
                {filtered.map((s, i) => (
                  <div
                    className="signal-item"
                    key={`${s.id}-${i}`}
                    onClick={() => setSelected(s.id === selected?.id ? null : s)}
                    style={selected?.id === s.id ? { borderColor: 'var(--border-accent)', background: 'rgba(139,92,246,0.07)' } : {}}
                  >
                    <PlatformIcon pKey={s.platform_key} platform={s.platform} />
                    <div className="signal-body">
                      <div className="signal-meta">
                        <span className="signal-platform-name">{s.platform_label}</span>
                        <TypePill type={s.signal_type} />
                        <span className="signal-time">{s.time}</span>
                      </div>
                      <div className="signal-text" title={s.text}>{s.text}</div>
                      {products.find(p => p.id === s.product_id) && (
                        <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-4)' }}>
                          → {products.find(p => p.id === s.product_id)?.name}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <div className={`score-value ${s.score >= 85 ? 'score-high' : s.score >= 70 ? 'score-medium' : 'score-low'}`}>
                        {s.score}
                      </div>
                      <div className="score-label">Match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selected ? (
            <SignalDetail signal={selected} onClose={() => setSelected(null)} products={products} />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div className="empty-icon" style={{ margin: '0 auto 14px' }}><Brain size={22} /></div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-2)' }}>Select a Signal</div>
              <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 5, lineHeight: 1.55 }}>
                Click any signal for AI analysis and recommended action
              </div>
            </div>
          )}

          {/* Signal type breakdown */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 14 }}>
              <span className="card-title">Signal Breakdown</span>
            </div>
            {typeCounts.map(t => (
              <div key={t.type} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize', fontWeight: 500 }}>{t.type}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{t.pct}%</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-mono)', minWidth: 18, textAlign: 'right' }}>{t.count}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill progress-purple" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Two-stage matching */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.06) 0%, rgba(6,182,212,0.04) 100%)' }}>
            <div className="card-header" style={{ marginBottom: 14 }}>
              <span className="card-title">Matching Algorithm</span>
            </div>
            {[
              { num: '1', label: 'Vector Search', desc: 'Semantic cosine similarity on all Product Intelligence Profile embeddings. Threshold: 0.75.', color: 'var(--violet-400)' },
              { num: '2', label: 'LLM Verification', desc: 'Top 5 matches sent to Claude. Returns relevance score 0–100 and recommended action type.', color: 'var(--cyan-400)' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: s.color, flexShrink: 0 }}>
                  {s.num}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
