import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Package, Zap } from 'lucide-react'
import { useSignals } from '../hooks/useSignals'
import { useActions } from '../hooks/useActions'
import { useAnalytics } from '../hooks/useAnalytics'
import { useProducts } from '../hooks/useProducts'
import { usePlatforms } from '../hooks/usePlatforms'

function useCounter(target, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
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
  }, [target, duration])
  return count
}

function MetricCard({ label, value, change, up, colorClass, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  const count = useCounter(visible ? (typeof value === 'number' ? value : parseInt(value) || 0) : 0, 1100)

  return (
    <div className={`metric-card ${colorClass}`} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${colorClass} count-animate`}>
        {typeof value === 'string' && value.startsWith('$') ? value : count.toLocaleString()}
      </div>
      <div className={`metric-change ${up ? 'up' : 'down'}`}>
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        <strong>{change}</strong>
        <span>vs yesterday</span>
      </div>
    </div>
  )
}

function TypePill({ type }) {
  return <span className={`signal-type-pill type-${type}`}>{type}</span>
}

function LiveSignalFeed({ signals, live }) {
  return (
    <div className="signal-feed">
      {signals.slice(0, 9).map((s, i) => (
        <div className="signal-item" key={`${s.id}-${i}`} style={{ animation: i === 0 && live ? 'slide-in 0.35s ease' : 'none' }}>
          <div className={`signal-platform-icon platform-${s.platform}`}>{s.platform_key}</div>
          <div className="signal-body">
            <div className="signal-meta">
              <span className="signal-platform-name">{s.platform_label}</span>
              <TypePill type={s.signal_type} />
              <span className="signal-time">{s.time || 'recent'}</span>
            </div>
            <div className="signal-text" title={s.text}>{s.text}</div>
          </div>
          <div className="signal-score">
            <div className={`score-value ${s.score >= 85 ? 'score-high' : s.score >= 70 ? 'score-medium' : 'score-low'}`}>{s.score}</div>
            <div className="score-label">Match</div>
          </div>
        </div>
      ))}
      {signals.length === 0 && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-4)', fontSize: 12.5 }}>
          No signals yet — monitoring active platforms...
        </div>
      )}
    </div>
  )
}

function ChannelStatusGrid({ platforms }) {
  return (
    <div className="channel-grid">
      {platforms.map(ch => {
        const usePct = ch.daily_limit > 0 ? Math.round((ch.actions_today / ch.daily_limit) * 100) : 0
        const barColor = usePct > 80 ? '#f87171' : usePct > 60 ? '#fbbf24' : '#34d399'
        return (
          <div className="channel-card" key={ch.id}>
            <div className="channel-header">
              <span className="channel-name">{ch.name}</span>
              <span className={`channel-indicator ${ch.status}`} />
            </div>
            <div className="channel-stat">{ch.signals_today}</div>
            <div className="channel-sub">Signals Today</div>
            {ch.daily_limit > 0 && (
              <>
                <div className="channel-bar">
                  <div className="channel-bar-fill" style={{ width: `${Math.min(usePct, 100)}%`, background: barColor }} />
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-4)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
                  <span>{ch.actions_today} used</span>
                  <span>{ch.daily_limit} max</span>
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
    geo:      { label: 'GEO',         color: 'var(--cyan-300)',   bg: 'rgba(34,211,238,0.06)' },
  }
  const t = typeMap[action.type] || typeMap.content
  const statusCls = action.status === 'success' ? 'badge-emerald' : action.status === 'processing' ? 'badge-amber' : 'badge-muted'
  const statusLabel = action.status === 'success' ? 'Executed' : action.status === 'processing' ? 'Processing' : 'Queued'
  const time = action.created_at ? new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <tr>
      <td>
        <span style={{ display: 'inline-block', padding: '3px 9px', background: t.bg, color: t.color, borderRadius: 100, fontSize: 10.5, fontWeight: 700 }}>
          {t.label}
        </span>
      </td>
      <td style={{ color: 'var(--text-1)', fontWeight: 500, maxWidth: 260 }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12.5 }}>{action.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.description}</div>
      </td>
      <td><span className="badge badge-violet" style={{ fontSize: 10 }}>{action.product_name}</span></td>
      <td><span className={`badge ${statusCls}`}>{statusLabel}</span></td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)' }}>{time}</td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: action.clicks > 0 ? 'var(--green-400)' : 'var(--text-4)', fontWeight: 700 }}>
        {action.clicks > 0 ? `+${action.clicks}` : '—'}
      </td>
    </tr>
  )
}

export default function Dashboard({ onNavigate }) {
  const { summary }                           = useAnalytics()
  const { signals, live, simulateSignals }    = useSignals({ limit: 12 })
  const { actions }                           = useActions({ limit: 8 })
  const { products }                          = useProducts()
  const { platforms }                         = usePlatforms()
  const [scanning, setScanning]               = useState(false)
  const [scanned, setScanned]                 = useState(false)

  const stats = summary || {}

  async function runFirstScan() {
    if (!products.length) { onNavigate('products'); return }
    setScanning(true)
    try {
      const pid = products.find(p => p.status === 'active')?.id || products[0].id
      await simulateSignals(pid, 6)
      setScanned(true)
    } catch (e) { console.error(e) }
    finally { setScanning(false) }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-subtitle">
            Monitoring <strong style={{ color: 'var(--violet-400)' }}>{products.length || 5} products</strong> across{' '}
            <strong style={{ color: 'var(--cyan-400)' }}>8 platforms</strong> — AI engine active
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="live-badge"><span className="live-dot" /> Live</div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('products')}>
            <Package size={13} /> Add Product
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Active Products"  value={stats.activeProducts || 0}  change="+1"   up colorClass="violet" delay={0}   />
        <MetricCard label="Signals Today"    value={stats.signalsToday || 0}     change={stats.signalsChange || '+18%'} up colorClass="cyan"   delay={80}  />
        <MetricCard label="Actions Taken"    value={stats.totalActions || 0}     change={stats.actionsChange || '+24%'} up colorClass="green"  delay={160} />
        <MetricCard label="Leads Generated"  value={stats.totalLeads || 0}       change={stats.leadsChange || '+12%'}   up colorClass="amber"  delay={240} />
      </div>

      {/* Empty state — no signals yet */}
      {signals.length === 0 && !scanning && !scanned && (
        <div style={{
          background: 'rgba(207,108,79,0.07)', border: '1px solid rgba(207,108,79,0.2)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>
              🎯 Run your first signal scan
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
              {products.length
                ? `Scanning ${products[0]?.name} across 8 platforms for intent signals...`
                : 'Add a product first, then scan for people looking for what you offer.'}
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={runFirstScan}
            style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <Zap size={14} />
            {products.length ? 'Scan Now' : 'Add Product'}
          </button>
        </div>
      )}

      {scanning && (
        <div style={{
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 16, padding: '20px 28px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-400)', boxShadow: '0 0 8px rgba(52,211,153,0.8)', animation: 'glow-pulse 1s ease-in-out infinite', flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: 'var(--green-400)', fontWeight: 600 }}>
            Scanning platforms for intent signals — this takes about 15 seconds...
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live Intent Signals</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: 'var(--green-400)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 100, padding: '3px 10px' }}>
                <span style={{ width: 5, height: 5, background: 'var(--green-400)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                {live ? 'NEW SIGNAL' : 'STREAMING'}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-4)' }}>All</span>
            </div>
          </div>
          <LiveSignalFeed signals={signals} live={live} />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Platform Coverage</span>
          </div>
          <ChannelStatusGrid platforms={platforms.length ? platforms : []} />
        </div>
      </div>

      {actions.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <span className="card-title">Recent Actions</span>
            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{actions.length} total</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th><th>Action</th><th>Product</th><th>Status</th><th>Time</th><th>Clicks</th>
              </tr>
            </thead>
            <tbody>{actions.slice(0, 6).map(a => <ActionRow key={a.id} action={a} />)}</tbody>
          </table>
        </div>
      )}

      {products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {products.slice(0, 5).map(p => (
            <div key={p.id} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => onNavigate('products')}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{p.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
                  <div style={{ width: `${p.match_score || 80}%`, height: '100%', background: p.color || 'var(--violet-500)', borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: p.color || 'var(--violet-400)', fontFamily: 'var(--font-mono)' }}>{p.match_score || 80}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 9.5, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                <span style={{ color: p.status === 'active' ? 'var(--green-400)' : 'var(--amber-400)' }}>● </span>{p.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
