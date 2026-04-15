import { Router } from 'express'
import supabase, { check } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    // Get user's product IDs first, then fetch actions
    const { data: products } = await supabase.from('products').select('id, name').eq('user_id', req.user.id)
    const productIds = (products || []).map(p => p.id)
    if (productIds.length === 0) return res.json([])

    const nameMap = Object.fromEntries((products || []).map(p => [p.id, p.name]))

    let query = supabase.from('actions').select('*').in('product_id', productIds)
    if (req.query.productId) query = query.eq('product_id', req.query.productId)
    if (req.query.type) query = query.eq('type', req.query.type)
    if (req.query.status) query = query.eq('status', req.query.status)
    query = query.order('created_at', { ascending: false }).limit(parseInt(req.query.limit) || 50)

    const { data } = await query
    res.json((data || []).map(a => ({ ...a, product_name: nameMap[a.product_id] || '' })))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { data: a } = await supabase.from('actions').select('*').eq('id', req.params.id).maybeSingle()
    if (!a) return res.status(404).json({ error: 'Not found' })
    const { data: p } = await supabase.from('products').select('name').eq('id', a.product_id).eq('user_id', req.user.id).maybeSingle()
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json({ ...a, product_name: p.name })
  } catch (err) { next(err) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['status', 'clicks', 'impressions']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields' })
    check(await supabase.from('actions').update(updates).eq('id', req.params.id))
    const { data } = await supabase.from('actions').select('*').eq('id', req.params.id).single()
    res.json(data)
  } catch (err) { next(err) }
})

export default router
