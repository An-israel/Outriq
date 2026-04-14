import { Router } from 'express'
import { getAll, getOne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/', (req, res) => {
  res.json(getAll('SELECT * FROM platform_channels ORDER BY id'))
})

router.patch('/:id', (req, res, next) => {
  try {
    const allowed = ['status', 'daily_limit']
    const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
    if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
    const set = updates.map(([k]) => `${k} = ?`).join(', ')
    run(`UPDATE platform_channels SET ${set} WHERE id = ?`, [...updates.map(([,v]) => v), req.params.id])
    res.json(getOne('SELECT * FROM platform_channels WHERE id = ?', [req.params.id]))
  } catch (err) { next(err) }
})

router.post('/reset', (req, res) => {
  run(`UPDATE platform_channels SET signals_today = 0, actions_today = 0, reset_at = datetime('now')`)
  res.json({ ok: true })
})

export default router
