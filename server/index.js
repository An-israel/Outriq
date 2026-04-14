import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { startWebSocket } from './websocket.js'
import { startScheduler } from './scheduler.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes         from './routes/auth.routes.js'
import productsRoutes     from './routes/products.routes.js'
import signalsRoutes      from './routes/signals.routes.js'
import actionsRoutes      from './routes/actions.routes.js'
import distributionRoutes from './routes/distribution.routes.js'
import analyticsRoutes    from './routes/analytics.routes.js'
import platformsRoutes    from './routes/platforms.routes.js'

const app  = express()
const PORT = process.env.PORT || 3001
const WS_PORT = parseInt(process.env.WS_PORT) || 3002

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'https://outriq.vercel.app'], credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth',         authRoutes)
app.use('/api/products',     productsRoutes)
app.use('/api/signals',      signalsRoutes)
app.use('/api/actions',      actionsRoutes)
app.use('/api/distribute',   distributionRoutes)
app.use('/api/analytics',    analyticsRoutes)
app.use('/api/platforms',    platformsRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }))

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n🚀 OUTRIQ API running on http://localhost:${PORT}`)
})

startWebSocket(WS_PORT)
startScheduler()
