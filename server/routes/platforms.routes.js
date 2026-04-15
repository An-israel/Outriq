import { Router } from 'express'
import supabase, { check } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    const { data } = await supabase.from('platform_channels').select('*').order('id')
    res.json(data || [])
  } catch (err) { next(err) }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['status', 'daily_limit']
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)))
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields' })
    check(await supabase.from('platform_channels').update(updates).eq('id', req.params.id))
    const { data } = await supabase.from('platform_channels').select('*').eq('id', req.params.id).single()
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/reset', async (req, res, next) => {
  try {
    check(await supabase.from('platform_channels').update({ signals_today: 0, actions_today: 0 }).neq('id', ''))
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
