import { Router } from 'express'
import { getAll, getOne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/', (req, res) => {
  let sql = `SELECT a.*, p.name as product_name FROM actions a
             JOIN products p ON p.id = a.product_id
             WHERE p.user_id = ?`
  const params = [req.user.id]

  if (req.query.productId) { sql += ' AND a.product_id = ?'; params.push(req.query.productId) }
  if (req.query.type)      { sql += ' AND a.type = ?';       params.push(req.query.type) }
  if (req.query.status)    { sql += ' AND a.status = ?';     params.push(req.query.status) }

  sql += ` ORDER BY a.created_at DESC LIMIT ${parseInt(req.query.limit) || 50}`
  res.json(getAll(sql, params))
})

router.get('/:id', (req, res) => {
  const a = getOne(`SELECT a.*, p.name as product_name FROM actions a
                    JOIN products p ON p.id = a.product_id
                    WHERE a.id = ? AND p.user_id = ?`, [req.params.id, req.user.id])
  if (!a) return res.status(404).json({ error: 'Not found' })
  res.json(a)
})

router.patch('/:id', (req, res, next) => {
  try {
    const allowed = ['status', 'clicks', 'impressions']
    const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
    if (!updates.length) return res.status(400).json({ error: 'No valid fields' })

    const set = updates.map(([k]) => `${k} = ?`).join(', ')
    run(`UPDATE actions SET ${set} WHERE id = ?`, [...updates.map(([,v]) => v), req.params.id])
    res.json(getOne('SELECT * FROM actions WHERE id = ?', [req.params.id]))
  } catch (err) { next(err) }
})

export default router
