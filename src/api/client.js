const BASE = '/api'

function getToken() {
  return localStorage.getItem('outriq_token')
}

export function setToken(token) {
  localStorage.setItem('outriq_token', token)
}

export function clearToken() {
  localStorage.removeItem('outriq_token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.reload()
    return
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

export const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
}

// WebSocket connection
const WS_URL = window.location.hostname === 'localhost' ? 'ws://localhost:3002' : null

export function connectWebSocket(onMessage) {
  if (!WS_URL) return null

  let ws = null
  let reconnectTimer = null

  function connect() {
    ws = new WebSocket(WS_URL)

    ws.onopen = () => console.log('[WS] Connected')
    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)) } catch {}
    }
    ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 3s...')
      reconnectTimer = setTimeout(connect, 3000)
    }
    ws.onerror = () => ws.close()
  }

  connect()

  return () => {
    clearTimeout(reconnectTimer)
    ws?.close()
  }
}
