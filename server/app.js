import 'dotenv/config'
import express from 'express'
import cors    from 'cors'
import helmet  from 'helmet'

import { errorHandler } from './middleware/errorHandler.js'
import authRoutes         from './routes/auth.routes.js'
import productsRoutes     from './routes/products.routes.js'
import signalsRoutes      from './routes/signals.routes.js'
import actionsRoutes      from './routes/actions.routes.js'
import distributionRoutes from './routes/distribution.routes.js'
import analyticsRoutes    from './routes/analytics.routes.js'
import platformsRoutes    from './routes/platforms.routes.js'

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: true, credentials: true }))

// Add request logging in dev only
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const { default: morgan } = await import('morgan')
  app.use(morgan('dev'))
}

app.use(express.json())

app.use('/api/auth',       authRoutes)
app.use('/api/products',   productsRoutes)
app.use('/api/signals',    signalsRoutes)
app.use('/api/actions',    actionsRoutes)
app.use('/api/distribute', distributionRoutes)
app.use('/api/analytics',  analyticsRoutes)
app.use('/api/platforms',  platformsRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }))

app.use(errorHandler)

export default app
