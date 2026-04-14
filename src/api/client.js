const BASE = '/api'

export function getToken()         { return localStorage.getItem('outriq_token') }
export function setToken(token)    { localStorage.setItem('outriq_token', token) }
export function clearToken()       { localStorage.removeItem('outriq_token') }

export async function apiFetch(path, options = {}) {
  const token   = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res  = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))

  if (res.status === 401 && !path.startsWith('/auth/')) {
    clearToken()
    window.location.reload()
    return
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${res.status}`)
    // Pass through any extra fields (e.g. needsVerify, userId, email, demoCode)
    Object.assign(err, data)
    throw err
  }

  return data
}

export const api = {
  get:    (path)       => apiFetch(path),
  post:   (path, body) => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path)       => apiFetch(path, { method: 'DELETE' }),
}

// WebSocket — only in local dev (server is separate on Vercel)
const WS_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'ws://localhost:3002'
  : null

export function connectWebSocket(onMessage) {
  if (!WS_URL) return null

  let ws = null
  let reconnectTimer = null

  function connect() {
    ws = new WebSocket(WS_URL)
    ws.onopen    = () => console.log('[WS] Connected')
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch {} }
    ws.onclose   = () => { reconnectTimer = setTimeout(connect, 3000) }
    ws.onerror   = () => ws.close()
  }

  connect()
  return () => { clearTimeout(reconnectTimer); ws?.close() }
}
