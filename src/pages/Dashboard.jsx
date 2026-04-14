import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Package, Radio, Zap, Users, ArrowRight } from 'lucide-react'
import { INTENT_SIGNALS, ACTIONS, PLATFORM_CHANNELS, SUMMARY_STATS, PRODUCTS } from '../data'

// Animated counter
function useCounter(target, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let frame = 0
    const totalFrames = Math.round(duration / 16)
    const timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (frame >= totalFrames) { setCount(target); clearInterval(timer) }
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return count
}

function MetricCard({ label, value, change, up, colorClass, icon: Icon, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  const count = useCounter(visible ? value : 0, 1100)

  return (
    <div className={`metric-card ${colorClass}`} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${colorClass} count-animate`}>
        {count.toLocaleString()}
      </div>
      <div className={`metric-change ${up ? 'up' : 'down'}`}>
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        <strong>{change}</strong>
        <span>vs yesterday</span>
      </div>
    </div>
  )
}

function PlatformIcon({ pKey, platform }) {
  return <div className={`signal-platform-icon platform-${platform}`}>{pKey}</div>
}

function TypePill({ type }) {
  return <span className={`signal-type-pill type-${type}`}>{type}</span>
}

function LiveSignalFeed({ signals }) {
  const [feed, setFeed] = useState(signals.slice(0, 7))
  const counterRef = useRef(7)

  useEffect(() => {
    const interval = setInterval(() => {
      const next = { ...signals[counterRef.current % signals.length], id: `live-${counterRef.current}`, time: 'just now' }
      counterRef.current++
      setFeed(prev => [next, ...prev].slice(0, 9))
    }, 5000)
    return () => clearInterval(interval)
  }, [signals])

  return (
    <div className="signal-feed">
      {feed.map((s, i) => (
        <div className="signal-item" key={`${s.id}-${i}`}>
          <PlatformIcon pKey={s.platformKey} platform={s.platform} />
          <div className="signal-body">
            <div className="signal-meta">
              <span className="signal-platform-name">{s.platformLabel}</span>
              <TypePill type={s.signalType} />
              <span className="signal-time">{s.time}</span>
            </div>
            <div className="signal-text" title={s.text}>{s.text}</div>
          </div>
          <div className="signal-score">
            <div className={`score-value ${s.score >= 85 ? 'score-high' : s.score >= 70 ? 'score-medium' : 'score-low'}`}>
              {s.score}
            </div>
            <div className="score-label">Match</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChannelStatusGrid({ channels }) {
  return (
    <div className="channel-grid">
      {channels.slice(0, 8).map(ch => {
        const usePct = ch.limit > 0 ? Math.round((ch.actionsToday / ch.limit) * 100) : 0
        const barColor = usePct > 80 ? '#f87171' : usePct > 60 ? '#fbbf24' : '#34d399'
        return (
          <div className="channel-card" key={ch.id}>
            <div className="channel-header">
              <span className="channel-name">{ch.name}</span>
              <span className={`channel-indicator ${ch.status}`} />
            </div>
            <div className="channel-stat">{ch.signals}</div>
            <div className="channel-sub">Signals Today</div>
            {ch.limit > 0 && (
              <>
                <div className="channel-bar">
                  <div className="channel-bar-fill" style={{ width: `${usePct}%`, background: barColor }} />
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-4)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
                  <span>{ch.actionsToday} used</span>
                  <span>{ch.limit} max</span>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ActionRow({ action }) {
  const typeMap = {
    respond:  { label: 'Response',    color: 'var(--violet-400)', bg: 'rgba(139,92,246,0.1)' },
    content:  { label: 'SEO Content', color: 'var(--cyan-400)',   bg: 'rgba(34,211,238,0.08)' },
    outreach: { label: 'Outreach',    color: 'var(--green-400)',  bg: 'rgba(16,185,129,0.08)' },
    landing:  { label: 'Landing Page',color: 'var(--amber-400)',  bg: 'rgba(245,158,11,0.08)' },
  }
  const t = typeMap[action.type] || typeMap.content
  const statusCls = action.status === 'success' ? 'badge-emerald' : action.status === 'processing' ? 'badge-amber' : 'badge-muted'
  const statusLabel = action.status === 'success' ? 'Executed' : action.status === 'processing' ? 'Processing' : 'Queued'

  return (
    <tr>
      <td>
        <span style={{ display: 'inline-block', padding: '3px 9px', background: t.bg, color: t.color, borderRadius: 100, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px' }}>
          {t.label}
        </span>
      </td>
      <td style={{ color: 'var(--text-1)', fontWeight: 500, maxWidth: 260 }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12.5 }}>{action.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.desc}</div>
      </td>
      <td><span className="badge badge-violet" style={{ fontSize: 10 }}>{action.product}</span></td>
      <td><span className={`badge ${statusCls}`}>{statusLabel}</span></td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)' }}>{action.time}</td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: action.metrics.clicks > 0 ? 'var(--green-400)' : 'var(--text-4)', fontWeight: 700 }}>
        {action.metrics.clicks > 0 ? `+${action.metrics.clicks}` : '—'}
      </td>
    </tr>
  )
}

export default function Dashboard({ onNavigate }) {
  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-subtitle">
            Monitoring <strong style={{ color: 'var(--violet-400)', fontWeight: 700 }}>5 products</strong> across{' '}
            <strong style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>8 platforms</strong> — AI engine active
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="live-badge">
            <span className="live-dot" /> Live
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('products')}>
            <Package size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Hero metric cards */}
      <div className="metrics-grid">
        <MetricCard label="Active Products"  value={SUMMARY_STATS.activeProducts} change="+1"  up colorClass="violet" icon={Package} delay={0}   />
        <MetricCard label="Signals Today"    value={SUMMARY_STATS.signalsToday}   change={SUMMARY_STATS.signalsChange} up colorClass="cyan"   icon={Radio}   delay={80}  />
        <MetricCard label="Actions Taken"    value={SUMMARY_STATS.actionsToday}   change={SUMMARY_STATS.actionsChange} up colorClass="green"  icon={Zap}     delay={160} />
        <MetricCard label="Leads Generated"  value={SUMMARY_STATS.leadsToday}     change={SUMMARY_STATS.leadsChange}   up colorClass="amber"  icon={Users}   delay={240} />
      </div>

      {/* Signal feed + channel health */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live Intent Signals</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="live-badge"><span className="live-dot" />Streaming</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('intelligence')}>
                All <ArrowRight size={11} />
              </button>
            </div>
          </div>
          <LiveSignalFeed signals={INTENT_SIGNALS} />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Platform Health</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('distribution')}>
              Manage <ArrowRight size={11} />
            </button>
          </div>
          <ChannelStatusGrid channels={PLATFORM_CHANNELS} />

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Active', val: '7/8' },
                { label: 'Rate OK', val: '7/7' },
                { label: 'API Health', val: '100%' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green-400)', fontFamily: 'var(--font-mono)', letterSpacing: -0.5 }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2, fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent actions */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <span className="card-title">Recent Actions</span>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('distribution')}>
            View All <ArrowRight size={11} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th><th>Action</th><th>Product</th><th>Status</th><th>Time</th><th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {ACTIONS.slice(0, 6).map(a => <ActionRow key={a.id} action={a} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products strip */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.4px' }}>Active Products</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('products')}>
            Manage All <ArrowRight size={11} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {PRODUCTS.map(p => (
            <div
              key={p.id}
              className="card"
              style={{ padding: 16, cursor: 'pointer' }}
              onClick={() => onNavigate('products')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: `${p.color}18`, border: `1px solid ${p.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0
                }}>
                  {p.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.2, lineHeight: 1.2 }}>{p.name}</div>
                  <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 9, padding: '1px 6px', marginTop: 3 }}>{p.status}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', letterSpacing: -0.8 }}>{p.metrics.signals}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Signals</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-400)', fontFamily: 'var(--font-mono)', letterSpacing: -0.8 }}>{p.metrics.leads}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Leads</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
