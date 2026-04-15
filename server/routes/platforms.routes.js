import { Router } from 'express'
import { getAll, getOne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    res.json(await getAll('SELECT * FROM platform_channels ORDER BY id'))
  } catch (err) { next(err) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['status', 'daily_limit']
    const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
    if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
    const set = updates.map(([k], idx) => `${k} = $${idx + 1}`).join(', ')
    await run(`UPDATE platform_channels SET ${set} WHERE id = $${updates.length + 1}`, [...updates.map(([,v]) => v), req.params.id])
    res.json(await getOne('SELECT * FROM platform_channels WHERE id = ?', [req.params.id]))
  } catch (err) { next(err) }
})

router.post('/reset', async (req, res, next) => {
  try {
    await run("UPDATE platform_channels SET signals_today = 0, actions_today = 0, reset_at = now()")
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
