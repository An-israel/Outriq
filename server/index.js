import app from './app.js'
import { startWebSocket } from './websocket.js'
import { startScheduler }  from './scheduler.js'

const PORT    = parseInt(process.env.PORT)    || 3001
const WS_PORT = parseInt(process.env.WS_PORT) || 3002

app.listen(PORT, () => {
  console.log(`\n🚀 OUTRIQ API  →  http://localhost:${PORT}`)
  console.log(`🔌 WebSocket    →  ws://localhost:${WS_PORT}\n`)
})

startWebSocket(WS_PORT)
startScheduler()
