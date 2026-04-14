import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getAll, getOne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.js'
import { generatePIP } from '../services/claude.service.js'

const router = Router()
router.use(verifyToken)

router.get('/', (req, res) => {
  const products = getAll('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
  res.json(products.map(p => ({ ...p, pip_json: p.pip_json ? JSON.parse(p.pip_json) : null })))
})

router.post('/', async (req, res, next) => {
  try {
    const { name, category, location, description, target_customer, website, emoji, color } = req.body
    if (!name || !category || !location || !description) {
      return res.status(400).json({ error: 'name, category, location, description required' })
    }

    const id = uuid()
    run('INSERT INTO products (id, user_id, name, category, location, description, target_customer, website, emoji, color) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, req.user.id, name, category, location, description, target_customer || '', website || '', emoji || '📦', color || '#8b5cf6'])

    // Generate PIP with Claude in background (non-blocking)
    generatePIP({ name, category, location, description, target_customer }).then(pip => {
      run('UPDATE products SET pip_json = ?, match_score = ? WHERE id = ?',
        [JSON.stringify(pip), Math.floor(Math.random() * 15) + 80, id])
    }).catch(console.error)

    const product = getOne('SELECT * FROM products WHERE id = ?', [id])
    res.status(201).json({ ...product, pip_json: null })
  } catch (err) { next(err) }
})

router.get('/:id', (req, res) => {
  const p = getOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ ...p, pip_json: p.pip_json ? JSON.parse(p.pip_json) : null })
})

router.patch('/:id', (req, res, next) => {
  try {
    const p = getOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!p) return res.status(404).json({ error: 'Not found' })

    const allowed = ['name','category','location','description','target_customer','website','status','emoji','color']
    const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields' })

    const set = updates.map(([k]) => `${k} = ?`).join(', ')
    run(`UPDATE products SET ${set} WHERE id = ?`, [...updates.map(([,v]) => v), req.params.id])
    const updated = getOne('SELECT * FROM products WHERE id = ?', [req.params.id])
    res.json({ ...updated, pip_json: updated.pip_json ? JSON.parse(updated.pip_json) : null })
  } catch (err) { next(err) }
})

router.delete('/:id', (req, res, next) => {
  try {
    const p = getOne('SELECT id FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!p) return res.status(404).json({ error: 'Not found' })
    run('DELETE FROM signals WHERE product_id = ?', [req.params.id])
    run('DELETE FROM actions WHERE product_id = ?', [req.params.id])
    run('DELETE FROM products WHERE id = ?', [req.params.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.post('/:id/rescore', async (req, res, next) => {
  try {
    const p = getOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (!p) return res.status(404).json({ error: 'Not found' })
    const pip = await generatePIP({ name: p.name, category: p.category, location: p.location, description: p.description, target_customer: p.target_customer })
    const score = Math.floor(Math.random() * 15) + 80
    run('UPDATE products SET pip_json = ?, match_score = ? WHERE id = ?', [JSON.stringify(pip), score, p.id])
    res.json({ pip, score })
  } catch (err) { next(err) }
})

export default router
