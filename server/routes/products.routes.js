import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import supabase, { check } from '../db.js'
import { verifyToken } from '../middleware/auth.js'
import { generatePIP } from '../services/claude.service.js'

const router = Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    const { data } = await supabase.from('products').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false })
    res.json((data || []).map(p => ({ ...p, pip_json: p.pip_json ? JSON.parse(p.pip_json) : null })))
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, category, location, description, target_customer, website, emoji, color } = req.body
    if (!name || !category || !location || !description) return res.status(400).json({ error: 'name, category, location, description required' })

    const id = uuid()
    check(await supabase.from('products').insert({
      id, user_id: req.user.id, name, category, location, description,
      target_customer: target_customer || '', website: website || '',
      emoji: emoji || '📦', color: color || '#8b5cf6'
    }))

    generatePIP({ name, category, location, description, target_customer }).then(async pip => {
      await supabase.from('products').update({ pip_json: JSON.stringify(pip), match_score: Math.floor(Math.random() * 15) + 80 }).eq('id', id)
    }).catch(console.error)

    const { data: product } = await supabase.from('products').select('*').eq('id', id).single()
    res.status(201).json({ ...product, pip_json: null })
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { data: p } = await supabase.from('products').select('*').eq('id', req.params.id).eq('user_id', req.user.id).maybeSingle()
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json({ ...p, pip_json: p.pip_json ? JSON.parse(p.pip_json) : null })
  } catch (err) { next(err) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { data: p } = await supabase.from('products').select('id').eq('id', req.params.id).eq('user_id', req.user.id).maybeSingle()
    if (!p) return res.status(404).json({ error: 'Not found' })

    const allowed = ['name','category','location','description','target_customer','website','status','emoji','color']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields' })

    check(await supabase.from('products').update(updates).eq('id', req.params.id))
    const { data: updated } = await supabase.from('products').select('*').eq('id', req.params.id).single()
    res.json({ ...updated, pip_json: updated.pip_json ? JSON.parse(updated.pip_json) : null })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: p } = await supabase.from('products').select('id').eq('id', req.params.id).eq('user_id', req.user.id).maybeSingle()
    if (!p) return res.status(404).json({ error: 'Not found' })
    await supabase.from('signals').delete().eq('product_id', req.params.id)
    await supabase.from('actions').delete().eq('product_id', req.params.id)
    check(await supabase.from('products').delete().eq('id', req.params.id))
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.post('/:id/rescore', async (req, res, next) => {
  try {
    const { data: p } = await supabase.from('products').select('*').eq('id', req.params.id).eq('user_id', req.user.id).maybeSingle()
    if (!p) return res.status(404).json({ error: 'Not found' })
    const pip = await generatePIP({ name: p.name, category: p.category, location: p.location, description: p.description, target_customer: p.target_customer })
    const score = Math.floor(Math.random() * 15) + 80
    check(await supabase.from('products').update({ pip_json: JSON.stringify(pip), match_score: score }).eq('id', p.id))
    res.json({ pip, score })
  } catch (err) { next(err) }
})

export default router
