import { useState } from 'react'
import { Target, RefreshCw, Zap, Copy, Check, Archive } from 'lucide-react'
import { useSignals } from '../hooks/useSignals'
import { useProducts } from '../hooks/useProducts'
import { api } from '../api/client'

/* ── Urgency tiers ──────────────────────────────────────────── */
const URGENCY = {
  hot:  { label: 'Hot',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  warm: { label: 'Warm', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)' },
  mild: { label: 'Mild', color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.18)' },
}

function getUrgency(score) {
  if (score >= 85) return URGENCY.hot
  if (score >= 70) return URGENCY.warm
  return URGENCY.mild
}

function UrgencyBadge({ score }) {
  const u = getUrgency(score)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: u.bg, border: `1px solid ${u.border}`,
      fontSize: 11, fontWeight: 700, color: u.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.color }} />
      {u.label} · {score}
    </span>
  )
}

function PlatformIcon({ pKey, platform }) {
  return <div className={`signal-platform-icon platform-${platform}`}>{pKey}</div>
}

/* ── Opportunity card ───────────────────────────────────────── */
function OpportunityCard({ signal, product, isSelected, onClick }) {
  const u = getUrgency(signal.score)
  const status = signal.status || 'new'
  const isDone = status === 'responded' || status === 'dismissed'

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? 'rgba(207,108,79,0.08)' : isDone ? 'rgba(255,255,255,0.015)' : 'var(--bg-surface)',
        border: `1px solid ${isSelected ? 'rgba(207,108,79,0.3)' : 'var(--border-1)'}`,
        borderLeft: `3px solid ${isDone ? 'var(--text-4)' : u.color}`,
        borderRadius: 12, padding: '16px 18px',
        cursor: 'pointer', transition: 'all 150ms ease',
        opacity: isDone ? 0.55 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <PlatformIcon pKey={signal.platform_key} platform={signal.platform} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{signal.platform_label}</span>
            <UrgencyBadge score={signal.score} />
            {status !== 'new' && (
              <span style={{ fontSize: 10, color: 'var(--text-4)', fontStyle: 'italic', textTransform: 'capitalize' }}>{status}</span>
            )}
          </div>
          {product && <span style={{ fontSize: 10.5, color: 'var(--text-4)' }}>{product.emoji} {product.name}</span>}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>
          {signal.created_at ? new Date(signal.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
        </div>
      </div>

      <div style={{ fontSize: 13, color: isDone ? 'var(--text-4)' : 'var(--text-2)', lineHeight: 1.6, fontStyle: 'italic' }}>
        &ldquo;{signal.text}&rdquo;
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <span className={`signal-type-pill type-${signal.signal_type}`}>{signal.signal_type}</span>
      </div>
    </div>
  )
}

/* ── Detail panel ───────────────────────────────────────────── */
function DetailPanel({ signal, product, onClose, onStatusChange }) {
  const [reply, setReply]         = useState(signal.suggested_reply || '')
  const [generating, setGen]      = useState(false)
  const [copied, setCopied]       = useState(false)
  const [saving, setSaving]       = useState(false)

  async function generateReply() {
    setGen(true)
    try {
      const data = await api.post(`/signals/${signal.id}/suggest-reply`)
      setReply(data.reply)
    } catch (e) { console.error(e) }
    finally { setGen(false) }
  }

  async function copyReply() {
    await navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function markStatus(status) {
    setSaving(true)
    try {
      await api.patch(`/signals/${signal.id}`, { status, suggested_reply: reply || undefined })
      onStatusChange(signal.id, status)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-2)',
      borderRadius: 16, padding: 24, position: 'relative',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 14, right: 14,
        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-1)',
        borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)', fontSize: 16,
      }}>&times;</button>

      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 16 }}>
        Opportunity Details
      </div>

      {/* Platform + urgency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <PlatformIcon pKey={signal.platform_key} platform={signal.platform} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{signal.platform_label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2, textTransform: 'capitalize' }}>{signal.signal_type} signal</div>
        </div>
        <div style={{ marginLeft: 'auto' }}><UrgencyBadge score={signal.score} /></div>
      </div>

      {/* Original post */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 12,
        padding: '14px 16px', marginBottom: 16, border: '1px solid var(--border-1)',
      }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
          Original Post
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, fontStyle: 'italic' }}>
          &ldquo;{signal.text}&rdquo;
        </div>
      </div>

      {/* Matched product */}
      {product && (
        <div style={{
          background: 'rgba(255,255,255,0.025)', borderRadius: 12,
          padding: 14, border: '1px solid var(--border-1)', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>{product.emoji}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{product.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{product.category} &middot; {product.location}</div>
          </div>
        </div>
      )}

      {/* Suggested reply */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
          Suggested Reply
        </div>
        {reply ? (
          <div style={{ position: 'relative' }}>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              style={{
                width: '100%', minHeight: 120, boxSizing: 'border-box',
                background: 'rgba(207,108,79,0.06)', border: '1px solid rgba(207,108,79,0.18)',
                borderRadius: 12, padding: '14px 16px', paddingRight: 80,
                fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65,
                resize: 'vertical', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={copyReply} style={{
              position: 'absolute', top: 10, right: 10,
              background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border-1)'}`,
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600,
              color: copied ? 'var(--green-400)' : 'var(--text-3)',
              transition: 'all 150ms',
            }}>
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary w-full"
            onClick={generateReply}
            disabled={generating}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Zap size={13} />
            {generating ? 'Generating reply...' : 'Generate Suggested Reply'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => markStatus('responded')} disabled={saving}
        >
          <Check size={12} /> Mark Done
        </button>
        <button
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => markStatus('saved')} disabled={saving}
        >
          <Archive size={12} /> Save
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => markStatus('dismissed')} disabled={saving}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
export default function Opportunities() {
  const { signals, live, refresh, simulateSignals } = useSignals({ limit: 50 })
  const { products } = useProducts()
  const [selected, setSelected]           = useState(null)
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [filterStatus, setFilterStatus]   = useState('active')
  const [isRefreshing, setRefreshing]     = useState(false)
  const [simulating, setSimulating]       = useState(false)
  const [localStatuses, setLocalStatuses] = useState({})

  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const handleRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }

  const handleSimulate = async () => {
    if (!products.length) return
    setSimulating(true)
    const pid = products.find(p => p.status === 'active')?.id || products[0].id
    await simulateSignals(pid, 5)
    setSimulating(false)
  }

  const handleStatusChange = (id, status) => {
    setLocalStatuses(prev => ({ ...prev, [id]: status }))
    setSelected(null)
  }

  // Enrich with local status overrides
  const enriched = signals.map(s => ({ ...s, status: localStatuses[s.id] || s.status || 'new' }))

  // Filters
  const filtered = enriched.filter(s => {
    if (filterStatus === 'active' && (s.status === 'responded' || s.status === 'dismissed')) return false
    if (filterStatus === 'done' && s.status !== 'responded') return false
    if (filterStatus === 'saved' && s.status !== 'saved') return false
    if (filterUrgency === 'hot' && s.score < 85) return false
    if (filterUrgency === 'warm' && (s.score < 70 || s.score >= 85)) return false
    if (filterUrgency === 'mild' && s.score >= 70) return false
    return true
  })

  const hotCount  = enriched.filter(s => s.score >= 85 && s.status === 'new').length
  const warmCount = enriched.filter(s => s.score >= 70 && s.score < 85 && s.status === 'new').length
  const mildCount = enriched.filter(s => s.score < 70 && s.status === 'new').length
  const totalNew  = enriched.filter(s => s.status === 'new').length

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Opportunities</div>
          <div className="page-subtitle">
            {totalNew} new opportunities detected &mdash; respond before your competitors do
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="live-badge"><span className="live-dot" />{live ? 'NEW' : 'Monitoring'}</div>
          <button className="btn btn-secondary btn-sm" onClick={handleSimulate} disabled={simulating}>
            <Zap size={12} /> {simulating ? 'Scanning...' : 'Scan Now'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh}>
            <RefreshCw size={12} className={isRefreshing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Urgency summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total New',          val: totalNew,  color: 'var(--text-1)' },
          { label: 'Hot Opportunities',   val: hotCount,  color: '#ef4444' },
          { label: 'Warm Opportunities',  val: warmCount, color: '#f59e0b' },
          { label: 'Mild Opportunities',  val: mildCount, color: '#eab308' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-1)',
            borderRadius: 16, padding: '18px 20px',
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -2, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { id: 'active', label: 'Active' },
          { id: 'all',    label: 'All' },
          { id: 'done',   label: 'Done' },
          { id: 'saved',  label: 'Saved' },
        ].map(f => (
          <button key={f.id} className={`btn btn-sm ${filterStatus === f.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus(f.id)}>
            {f.label}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border-1)', margin: '0 6px' }} />

        {[
          { id: 'all',  label: 'All Urgency' },
          { id: 'hot',  label: 'Hot' },
          { id: 'warm', label: 'Warm' },
          { id: 'mild', label: 'Mild' },
        ].map(f => (
          <button key={f.id} className={`btn btn-sm ${filterUrgency === f.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterUrgency(f.id)}>
            {f.label}
          </button>
        ))}

        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} results
        </span>
      </div>

      {/* Two-column layout */}
      <div className="intel-grid">
        {/* Left: feed */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', paddingRight: 4 }}>
            {filtered.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>&#128269;</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>No opportunities yet</div>
                <div style={{ fontSize: 12, color: 'var(--text-4)', lineHeight: 1.6 }}>
                  Click &ldquo;Scan Now&rdquo; to detect intent signals across platforms
                </div>
              </div>
            )}
            {filtered.map((s, i) => (
              <OpportunityCard
                key={`${s.id}-${i}`}
                signal={s}
                product={productMap[s.product_id]}
                isSelected={selected?.id === s.id}
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
              />
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div style={{ position: 'sticky', top: 0, alignSelf: 'start' }}>
          {selected ? (
            <DetailPanel
              key={selected.id}
              signal={selected}
              product={productMap[selected.product_id]}
              onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(207,108,79,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Target size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Select an Opportunity</div>
              <div style={{ fontSize: 12, color: 'var(--text-4)', lineHeight: 1.6 }}>
                Click any signal to see details, generate a suggested reply, and take action
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
