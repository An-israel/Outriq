import { Router } from 'express'
import { getAll, getOne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    let sql = `SELECT a.*, p.name as product_name FROM actions a
               JOIN products p ON p.id = a.product_id
               WHERE p.user_id = $1`
    const params = [req.user.id]
    let idx = 2

    if (req.query.productId) { sql += ` AND a.product_id = $${idx++}`; params.push(req.query.productId) }
    if (req.query.type)      { sql += ` AND a.type = $${idx++}`;       params.push(req.query.type) }
    if (req.query.status)    { sql += ` AND a.status = $${idx++}`;     params.push(req.query.status) }

    sql += ` ORDER BY a.created_at DESC LIMIT ${parseInt(req.query.limit) || 50}`
    res.json(await getAll(sql, params))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const a = await getOne(`SELECT a.*, p.name as product_name FROM actions a
                    JOIN products p ON p.id = a.product_id
                    WHERE a.id = ? AND p.user_id = ?`, [req.params.id, req.user.id])
    if (!a) return res.status(404).json({ error: 'Not found' })
    res.json(a)
  } catch (err) { next(err) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['status', 'clicks', 'impressions']
    const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
    if (!updates.length) return res.status(400).json({ error: 'No valid fields' })

    const set = updates.map(([k], idx) => `${k} = $${idx + 1}`).join(', ')
    await run(`UPDATE actions SET ${set} WHERE id = $${updates.length + 1}`, [...updates.map(([,v]) => v), req.params.id])
    res.json(await getOne('SELECT * FROM actions WHERE id = ?', [req.params.id]))
  } catch (err) { next(err) }
})

export default router
