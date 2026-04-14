import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { useAnalytics } from '../hooks/useAnalytics'

function LineChart({ data, width = 700, height = 170 }) {
  const pad = { top: 20, right: 20, bottom: 28, left: 40 }
  const w = width - pad.left - pad.right
  const h = height - pad.top - pad.bottom
  const maxVal = Math.max(...data.flatMap(d => [d.signals, d.actions, d.leads])) * 1.12

  const x = i => pad.left + (i / (data.length - 1)) * w
  const y = v => pad.top + h - (v / maxVal) * h
  const path = key => data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d[key])}`).join(' ')
  const area = key => `${path(key)} L${x(data.length - 1)},${pad.top + h} L${pad.left},${pad.top + h} Z`
  const grid = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(maxVal * p))

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="chart-area">
      <defs>
        <linearGradient id="ga-s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ga-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ga-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={y(v)} x2={pad.left + w} y2={y(v)} className="chart-grid-line" />
          <text x={pad.left - 6} y={y(v) + 4} textAnchor="end" className="chart-label">{v}</text>
        </g>
      ))}
      <path d={area('signals')} fill="url(#ga-s)" />
      <path d={area('actions')} fill="url(#ga-a)" />
      <path d={area('leads')}   fill="url(#ga-l)" />
      <path d={path('signals')} fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path('actions')} fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path('leads')}   fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.signals)} r="3" fill="#22d3ee" />
          <circle cx={x(i)} cy={y(d.actions)} r="3" fill="#8b5cf6" />
          <circle cx={x(i)} cy={y(d.leads)}   r="2.5" fill="#10b981" />
          <text x={x(i)} y={pad.top + h + 17} textAnchor="middle" className="chart-label">{d.day || d.month}</text>
        </g>
      ))}
    </svg>
  )
}

function FunnelChart({ data }) {
  const colors = ['var(--cyan-400)', 'var(--violet-400)', '#3b82f6', 'var(--amber-400)', 'var(--green-400)']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((stage, i) => (
        <div key={stage.stage}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'baseline' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500 }}>{stage.stage}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: colors[i], fontFamily: 'var(--font-mono)', letterSpacing: -0.5 }}>{stage.value.toLocaleString()}</span>
              <span style={{ fontSize: 10.5, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{stage.pct}%</span>
            </div>
          </div>
          <div className="progress-bar" style={{ height: 5 }}>
            <div style={{ width: `${stage.pct}%`, height: '100%', background: `linear-gradient(90deg, ${colors[i]}66, ${colors[i]})`, borderRadius: 3, transition: 'width 1.2s ease' }} />
          </div>
          {i < data.length - 1 && (
            <div style={{ textAlign: 'right', fontSize: 9.5, color: 'var(--text-4)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
              ↓ {((data[i + 1].value / stage.value) * 100).toFixed(1)}% conversion
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PlatformChart({ data }) {
  const max = Math.max(...data.map(d => d.signals))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map(d => (
        <div key={d.platform}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>{d.platform}</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{d.signals} sig</span>
              <span style={{ fontSize: 11, color: 'var(--green-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{d.leads} leads</span>
            </div>
          </div>
          <div className="progress-bar" style={{ height: 5, marginBottom: 2 }}>
            <div className="progress-fill progress-cyan" style={{ width: `${(d.signals / max) * 100}%`, transition: 'width 1s ease' }} />
          </div>
          <div className="progress-bar" style={{ height: 3 }}>
            <div className="progress-fill progress-emerald" style={{ width: `${(d.leads / data[0].leads) * 100}%`, transition: 'width 1.2s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('weekly')
  const { summary, performance, platforms, funnel, products: apiProducts, costs, loading } = useAnalytics()

  const PERFORMANCE_DATA = {
    weekly:     performance?.weekly || [],
    monthly:    performance?.monthly || [],
    byPlatform: platforms || [],
    funnel:     funnel || [],
  }
  const PRODUCTS    = apiProducts || []
  const COST_BREAKDOWN = costs || []

  const chartData  = timeframe === 'weekly' ? PERFORMANCE_DATA.weekly : PERFORMANCE_DATA.monthly
  const totalCost  = COST_BREAKDOWN.reduce((s, c) => s + parseInt((c.cost || '$0').replace('$', '')), 0)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Performance across all products and platforms</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['weekly', 'monthly'].map(t => (
            <button key={t} className={`btn btn-sm ${timeframe === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTimeframe(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Signals (Apr)', val: (summary?.totalSignals || 1520).toLocaleString(), change: summary?.signalsChange || '+10.1%', color: 'var(--cyan-400)' },
          { label: 'Total Actions (Apr)', val: (summary?.totalActions || 694).toLocaleString(),  change: summary?.actionsChange || '+13.4%', color: 'var(--violet-400)' },
          { label: 'Total Leads (Apr)',   val: (summary?.totalLeads || 203).toLocaleString(),    change: summary?.leadsChange  || '+14.0%', color: 'var(--green-400)' },
          { label: 'Avg Cost / Product', val: `$${Math.round(totalCost / 100)}`, change: '-2.1%', color: 'var(--amber-400)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-xl)', padding: '18px 20px' }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: -1.5, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.2px', margin: '8px 0 6px' }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: s.change.startsWith('+') ? 'var(--green-400)' : 'var(--red-400)', fontWeight: 600 }}>
              <TrendingUp size={11} /> {s.change} vs prev period
            </div>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header" style={{ marginBottom: 18 }}>
          <span className="card-title">Signal → Action → Lead Trend</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { color: '#22d3ee', label: 'Signals' },
              { color: '#8b5cf6', label: 'Actions' },
              { color: '#10b981', label: 'Leads' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-4)' }}>
                <div style={{ width: 18, height: 2, background: l.color, borderRadius: 1 }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <LineChart data={chartData} />
      </div>

      <div className="analytics-grid">
        {/* Platform breakdown */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}><span className="card-title">Platform Breakdown</span></div>
          <PlatformChart data={PERFORMANCE_DATA.byPlatform} />
        </div>

        {/* Conversion funnel */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}><span className="card-title">Conversion Funnel (April)</span></div>
          <FunnelChart data={PERFORMANCE_DATA.funnel} />
        </div>

        {/* Product table */}
        <div className="card analytics-full">
          <div className="card-header" style={{ marginBottom: 14 }}><span className="card-title">Product Performance</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>Status</th><th>Signals</th><th>Actions</th>
                  <th>Leads</th><th>Impressions</th><th>Clicks</th><th>Conv. Rate</th><th>AI Score</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map(p => {
                  const sig = p.signals_count || 0
                  const leads = p.leads_count || 0
                  const conv = sig > 0 ? ((leads / sig) * 100).toFixed(1) : '0.0'
                  const score = p.aiScore || p.match_score || 80
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span style={{ fontSize: 15 }}>{p.emoji}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 13, letterSpacing: -0.2 }}>{p.name}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{p.status}</span></td>
                      <td style={{ color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{sig}</td>
                      <td style={{ color: 'var(--violet-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p.actions_count || 0}</td>
                      <td style={{ color: 'var(--green-400)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{leads}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{(p.impressions || 0).toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{(p.clicks || 0).toLocaleString()}</td>
                      <td>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: parseFloat(conv) > 12 ? 'var(--green-400)' : 'var(--amber-400)', fontFamily: 'var(--font-mono)' }}>
                          {conv}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 44, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg, #6d28d9, #a78bfa)', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: score >= 85 ? 'var(--green-400)' : 'var(--amber-400)' }}>{score}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost projector */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 4 }}><span className="card-title">Infrastructure Cost (100 Products)</span></div>
          <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 14 }}>Projected monthly at scale — from the blueprint</div>
          {COST_BREAKDOWN.map(c => (
            <div className="cost-row" key={c.service}>
              <span className="cost-service">{c.service}</span>
              <span className="cost-amount">{c.cost}</span>
            </div>
          ))}
          <div className="cost-total">
            <span>Total / month</span>
            <span className="cost-amount">~${totalCost}</span>
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 10, fontSize: 12, color: 'var(--green-400)', lineHeight: 1.6 }}>
            At $40/product avg: <strong>${(5 * 40).toLocaleString()}/mo revenue</strong> on 5 products vs <strong>$${Math.round(totalCost / 20)}/mo cost</strong>. Unit economics work from day one.
          </div>
        </div>

        {/* Monthly growth */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 14 }}><span className="card-title">Monthly Growth</span></div>
          {PERFORMANCE_DATA.monthly.map(m => {
            const maxS = Math.max(...PERFORMANCE_DATA.monthly.map(d => d.signals))
            return (
              <div key={m.month} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' }}>{m.month} 2026</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.signals} sig</span>
                    <span style={{ fontSize: 11, color: 'var(--green-400)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.leads} leads</span>
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 5 }}>
                  <div className="progress-fill progress-purple" style={{ width: `${(m.signals / maxS) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
