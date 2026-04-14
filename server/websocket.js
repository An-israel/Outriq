import { WebSocketServer } from 'ws'

let wss = null
const clients = new Set()

export function startWebSocket(port) {
  wss = new WebSocketServer({ port })

  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log(`[WS] Client connected — ${clients.size} total`)

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`[WS] Client disconnected — ${clients.size} total`)
    })

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message)
      clients.delete(ws)
    })

    // Send welcome ping
    ws.send(JSON.stringify({ type: 'connected', message: 'OUTRIQ live feed active' }))
  })

  console.log(`[WS] WebSocket server running on port ${port}`)
  return wss
}

export function broadcast(data) {
  const payload = JSON.stringify(data)
  for (const ws of clients) {
    if (ws.readyState === 1) { // OPEN
      ws.send(payload)
    }
  }
}
