import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getAll, getOne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.js'
import { simulateSignals } from '../services/claude.service.js'
import { broadcast } from '../websocket.js'

const router = Router()
router.use(verifyToken)

const PLATFORM_META = {
  nairaland: { label: 'Nairaland', key: 'N', color: '#fb923c' },
  twitter:   { label: 'X/Twitter', key: 'X', color: '#60a5fa' },
  reddit:    { label: 'Reddit',    key: 'R', color: '#f97316' },
  linkedin:  { label: 'LinkedIn',  key: 'L', color: '#60a5fa' },
  instagram: { label: 'Instagram', key: 'I', color: '#f472b6' },
  google:    { label: 'Google Search', key: 'G', color: '#93c5fd' },
  quora:     { label: 'Quora',     key: 'Q', color: '#fca5a5' },
  email:     { label: 'Email',     key: 'E', color: '#a78bfa' },
}

router.get('/', async (req, res, next) => {
  try {
    let sql = `SELECT s.*, p.name as product_name FROM signals s
               JOIN products p ON p.id = s.product_id
               WHERE p.user_id = $1`
    const params = [req.user.id]
    let idx = 2

    if (req.query.productId) { sql += ` AND s.product_id = $${idx++}`; params.push(req.query.productId) }
    if (req.query.platform)  { sql += ` AND s.platform = $${idx++}`;   params.push(req.query.platform) }
    if (req.query.type)      { sql += ` AND s.signal_type = $${idx++}`; params.push(req.query.type) }

    sql += ` ORDER BY s.created_at DESC LIMIT ${parseInt(req.query.limit) || 50}`
    res.json(await getAll(sql, params))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const s = await getOne(`SELECT s.*, p.name as product_name, p.pip_json FROM signals s
                    JOIN products p ON p.id = s.product_id
                    WHERE s.id = ? AND p.user_id = ?`, [req.params.id, req.user.id])
    if (!s) return res.status(404).json({ error: 'Not found' })
    res.json(s)
  } catch (err) { next(err) }
})

router.post('/simulate', async (req, res, next) => {
  try {
    const { productId, platform, count = 3 } = req.body
    const product = await getOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, req.user.id])
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const platforms = platform ? [platform] : Object.keys(PLATFORM_META)
    const created = []

    for (const plat of platforms) {
      const meta = PLATFORM_META[plat]
      const signals = await simulateSignals(product, plat, Math.ceil(count / platforms.length))

      for (const s of signals) {
        const id = uuid()
        await run('INSERT INTO signals (id, product_id, platform, platform_label, platform_key, text, signal_type, score) VALUES (?,?,?,?,?,?,?,?)',
          [id, product.id, plat, meta.label, meta.key, s.text, s.type, s.score])
        await run('UPDATE products SET signals_count = signals_count + 1 WHERE id = ?', [product.id])
        await run('UPDATE platform_channels SET signals_today = signals_today + 1 WHERE id = ?', [plat])

        const signal = await getOne('SELECT * FROM signals WHERE id = ?', [id])
        created.push(signal)
        broadcast({ type: 'new_signal', signal: { ...signal, product_name: product.name } })
      }
    }

    res.json({ created: created.length, signals: created })
  } catch (err) { next(err) }
})

router.post('/:id/act', async (req, res, next) => {
  try {
    const signal = await getOne(`SELECT s.*, p.name as product_name, p.pip_json, p.category, p.location, p.description, p.target_customer
                           FROM signals s JOIN products p ON p.id = s.product_id
                           WHERE s.id = ? AND p.user_id = ?`, [req.params.id, req.user.id])
    if (!signal) return res.status(404).json({ error: 'Not found' })

    const { type = 'respond' } = req.body
    const actionId = uuid()

    await run(`INSERT INTO actions (id, product_id, signal_id, type, platform, title, description, status) VALUES (?,?,?,?,?,?,?,?)`,
      [actionId, signal.product_id, signal.id, type, signal.platform,
       `${type === 'respond' ? 'Response' : type} for ${signal.product_name}`,
       `Triggered from signal on ${signal.platform_label}`, 'processing'])

    await run('UPDATE signals SET acted_upon = 1, action_id = ? WHERE id = ?', [actionId, signal.id])

    // Generate content async
    import('../services/claude.service.js').then(async ({ generateResponse }) => {
      const content = await generateResponse(signal, signal)
      await run('UPDATE actions SET generated_content = ?, status = ? WHERE id = ?', [content, 'success', actionId])
      await run('UPDATE products SET actions_count = actions_count + 1 WHERE id = ?', [signal.product_id])
    }).catch(err => {
      run('UPDATE actions SET status = ? WHERE id = ?', ['failed', actionId]).catch(() => {})
      console.error(err)
    })

    const action = await getOne('SELECT * FROM actions WHERE id = ?', [actionId])
    res.json(action)
  } catch (err) { next(err) }
})

export default router
