import { useState } from 'react'
import { User, Bell, Activity, Shield, Key, Check, Loader, X } from 'lucide-react'
import { api } from '../api/client'

const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'activity',      label: 'Activity',        icon: Activity },
  { id: 'security',      label: 'Security',        icon: Shield },
]

function ProfileTab({ user }) {
  const [name, setName]       = useState(user?.name || '')
  const [email]               = useState(user?.email || '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  async function save(e) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      await api.patch('/auth/profile', { name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={headingStyle}>Profile</h2>
      <p style={subStyle}>Your name and email address.</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: '16px 0', borderBottom: '1px solid var(--border-1)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {user?.name?.slice(0,2).toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{user?.tier || 'free'} plan</div>
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}
      {saved  && <div style={successBox}><Check size={13} /> Changes saved</div>}

      <form onSubmit={save}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Full Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Email Address</label>
          <input className="form-input" value={email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          <div style={hintStyle}>Email cannot be changed after verification.</div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {saving ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newSignal:     true,
    actionTaken:   true,
    weeklyReport:  true,
    productAlerts: false,
    marketing:     false,
  })
  const [saved, setSaved] = useState(false)

  function toggle(key) { setPrefs(p => ({ ...p, [key]: !p[key] })) }

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const items = [
    { key: 'newSignal',     label: 'New intent signals',     desc: 'Get notified when a high-confidence signal is detected for your products.' },
    { key: 'actionTaken',   label: 'Actions executed',       desc: 'When OUTRIQ posts a response, article, or outreach on your behalf.' },
    { key: 'weeklyReport',  label: 'Weekly performance report', desc: 'Summary of signals, actions, and leads generated each week.' },
    { key: 'productAlerts', label: 'Product status changes', desc: 'When a product is paused due to rate limits or quality filters.' },
    { key: 'marketing',     label: 'Product updates & news', desc: 'OUTRIQ feature releases and tips.' },
  ]

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={headingStyle}>Notifications</h2>
      <p style={subStyle}>Choose what you want to be notified about.</p>
      {saved && <div style={successBox}><Check size={13} /> Preferences saved</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
            <div style={{ flex: 1, paddingRight: 24 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55 }}>{item.desc}</div>
            </div>
            <label className="toggle" style={{ flexShrink: 0, marginTop: 2 }}>
              <input type="checkbox" checked={prefs[item.key]} onChange={() => toggle(item.key)} />
              <span className="toggle-track" />
            </label>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={save}>Save Preferences</button>
    </div>
  )
}

function ActivityTab({ user }) {
  const items = [
    { icon: '🔐', text: 'Account created',            sub: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today' },
    { icon: '✉️', text: 'Email verified',              sub: 'Verification completed' },
    { icon: '📦', text: 'First product added',        sub: 'AI Intelligence Profile generated' },
    { icon: '🔍', text: 'Signal monitoring started',  sub: 'Watching 8 platforms' },
    { icon: '🚀', text: 'First action executed',      sub: 'OUTRIQ posted on your behalf' },
  ]

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={headingStyle}>Activity</h2>
      <p style={subStyle}>Recent account activity and key events.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{item.text}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityTab() {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [confirm, setConfirm]       = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')

  async function changePassword(e) {
    e.preventDefault()
    if (newPwd !== confirm) { setError('New passwords do not match'); return }
    if (newPwd.length < 6)  { setError('Password must be at least 6 characters'); return }
    setSaving(true); setError('')
    try {
      await api.post('/auth/change-password', { currentPassword: currentPwd, newPassword: newPwd })
      setSaved(true)
      setCurrentPwd(''); setNewPwd(''); setConfirm('')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={headingStyle}>Security</h2>
      <p style={subStyle}>Manage your password and account security.</p>

      {error && <div style={errorBox}>{error}</div>}
      {saved  && <div style={successBox}><Check size={13} /> Password updated successfully</div>}

      <form onSubmit={changePassword}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Current Password</label>
          <input className="form-input" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" required />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>New Password</label>
          <input className="form-input" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="At least 6 characters" required />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Confirm New Password</label>
          <input className="form-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {saving ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Key size={13} />}
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div style={{ marginTop: 36, padding: '18px 0', borderTop: '1px solid var(--border-1)' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--red-400)', marginBottom: 6 }}>Danger Zone</div>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14 }}>Deleting your account is permanent and cannot be undone. All products and data will be removed.</p>
        <button className="btn btn-secondary" style={{ color: 'var(--red-400)', borderColor: 'rgba(248,113,113,0.25)', fontSize: 12.5 }}>
          Delete Account
        </button>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────
const headingStyle = { fontSize: 18, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.3, marginBottom: 6 }
const subStyle     = { fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.55 }
const fieldGroup   = { marginBottom: 18 }
const labelStyle   = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', marginBottom: 6, letterSpacing: '0.3px' }
const hintStyle    = { fontSize: 11.5, color: 'var(--text-4)', marginTop: 5 }
const errorBox     = { background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--red-400)', fontSize: 12.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }
const successBox   = { background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--green-400)', fontSize: 12.5, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }

export default function Settings({ user, initialTab = 'profile', onClose }) {
  const [tab, setTab] = useState(initialTab)

  const tabContent = {
    profile:       <ProfileTab user={user} />,
    notifications: <NotificationsTab />,
    activity:      <ActivityTab user={user} />,
    security:      <SecurityTab />,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-2)', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '85vh', display: 'flex', overflow: 'hidden', position: 'relative' }}
        onClick={e => e.stopPropagation()}>

        {/* Left nav */}
        <div style={{ width: 180, flexShrink: 0, borderRight: '1px solid var(--border-1)', padding: '24px 12px', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', marginBottom: 16, paddingLeft: 10, letterSpacing: '0.5px' }}>Settings</div>
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === t.id ? 'var(--bg-active)' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--text-2)', transition: 'all 120ms ease', marginBottom: 2, textAlign: 'left' }}>
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {tabContent[tab]}
        </div>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'var(--bg-hover)', border: '1px solid var(--border-1)', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)' }}>
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
