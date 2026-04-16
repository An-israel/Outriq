import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import supabase, { check } from '../db.js'
import { verifyToken } from '../middleware/auth.js'
import { simulateSignals } from '../services/claude.service.js'
import { broadcast } from '../websocket.js'

const router = Router()
router.use(verifyToken)

const PLATFORM_META = {
  nairaland: { label: 'Nairaland', key: 'N' }, twitter: { label: 'X/Twitter', key: 'X' },
  reddit: { label: 'Reddit', key: 'R' }, linkedin: { label: 'LinkedIn', key: 'L' },
  instagram: { label: 'Instagram', key: 'I' }, google: { label: 'Google Search', key: 'G' },
  quora: { label: 'Quora', key: 'Q' }, email: { label: 'Email', key: 'E' },
}

router.get('/', async (req, res, next) => {
  try {
    const { data: products } = await supabase.from('products').select('id, name').eq('user_id', req.user.id)
    const productIds = (products || []).map(p => p.id)
    if (productIds.length === 0) return res.json([])

    const nameMap = Object.fromEntries((products || []).map(p => [p.id, p.name]))
    let query = supabase.from('signals').select('*').in('product_id', productIds)
    if (req.query.productId) query = query.eq('product_id', req.query.productId)
    if (req.query.platform) query = query.eq('platform', req.query.platform)
    if (req.query.type) query = query.eq('signal_type', req.query.type)
    query = query.order('created_at', { ascending: false }).limit(parseInt(req.query.limit) || 50)

    const { data } = await query
    res.json((data || []).map(s => ({ ...s, product_name: nameMap[s.product_id] || '' })))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { data: s } = await supabase.from('signals').select('*').eq('id', req.params.id).maybeSingle()
    if (!s) return res.status(404).json({ error: 'Not found' })
    const { data: p } = await supabase.from('products').select('name, pip_json').eq('id', s.product_id).eq('user_id', req.user.id).maybeSingle()
    if (!p) return res.status(404).json({ error: 'Not found' })
    res.json({ ...s, product_name: p.name, pip_json: p.pip_json })
  } catch (err) { next(err) }
})

router.post('/simulate', async (req, res, next) => {
  try {
    const { productId, platform, count = 3 } = req.body
    const { data: product } = await supabase.from('products').select('*').eq('id', productId).eq('user_id', req.user.id).maybeSingle()
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const platforms = platform ? [platform] : Object.keys(PLATFORM_META)
    const created = []

    for (const plat of platforms) {
      const meta = PLATFORM_META[plat]
      if (!meta) continue
      const signals = await simulateSignals(product, plat, Math.ceil(count / platforms.length))

      for (const s of signals) {
        const id = uuid()
        check(await supabase.from('signals').insert({ id, product_id: product.id, platform: plat, platform_label: meta.label, platform_key: meta.key, text: s.text, signal_type: s.type, score: s.score }))
        await supabase.from('products').update({ signals_count: (product.signals_count || 0) + 1 }).eq('id', product.id)
        await supabase.from('platform_channels').update({ signals_today: 0 }).eq('id', plat) // simplified

        const { data: signal } = await supabase.from('signals').select('*').eq('id', id).single()
        created.push(signal)
        broadcast({ type: 'new_signal', signal: { ...signal, product_name: product.name } })
      }
    }

    res.json({ created: created.length, signals: created })
  } catch (err) { next(err) }
})

// ── Update signal status (new/responded/saved/dismissed) ─────
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, suggested_reply } = req.body
    const allowed = ['new', 'responded', 'saved', 'dismissed']
    if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })

    const updates = {}
    if (status) updates.status = status
    if (suggested_reply !== undefined) updates.suggested_reply = suggested_reply

    check(await supabase.from('signals').update(updates).eq('id', req.params.id))
    const { data } = await supabase.from('signals').select('*').eq('id', req.params.id).single()
    res.json(data)
  } catch (err) { next(err) }
})

// ── Generate suggested reply (synchronous) ───────────────────
router.post('/:id/suggest-reply', async (req, res, next) => {
  try {
    const { data: signal } = await supabase.from('signals').select('*').eq('id', req.params.id).maybeSingle()
    if (!signal) return res.status(404).json({ error: 'Not found' })
    const { data: product } = await supabase.from('products').select('*').eq('id', signal.product_id).eq('user_id', req.user.id).maybeSingle()
    if (!product) return res.status(404).json({ error: 'Not found' })

    const { generateResponse } = await import('../services/claude.service.js')
    const reply = await generateResponse(signal, product)

    await supabase.from('signals').update({ suggested_reply: reply }).eq('id', signal.id)

    res.json({ reply })
  } catch (err) { next(err) }
})

router.post('/:id/act', async (req, res, next) => {
  try {
    const { data: signal } = await supabase.from('signals').select('*').eq('id', req.params.id).maybeSingle()
    if (!signal) return res.status(404).json({ error: 'Not found' })
    const { data: product } = await supabase.from('products').select('*').eq('id', signal.product_id).eq('user_id', req.user.id).maybeSingle()
    if (!product) return res.status(404).json({ error: 'Not found' })

    const { type = 'respond' } = req.body
    const actionId = uuid()

    check(await supabase.from('actions').insert({
      id: actionId, product_id: signal.product_id, signal_id: signal.id, type, platform: signal.platform,
      title: `${type === 'respond' ? 'Response' : type} for ${product.name}`,
      description: `Triggered from signal on ${signal.platform_label}`, status: 'processing'
    }))
    check(await supabase.from('signals').update({ acted_upon: 1, action_id: actionId }).eq('id', signal.id))

    import('../services/claude.service.js').then(async ({ generateResponse }) => {
      const content = await generateResponse(signal, product)
      await supabase.from('actions').update({ generated_content: content, status: 'success' }).eq('id', actionId)
      await supabase.from('products').update({ actions_count: (product.actions_count || 0) + 1 }).eq('id', product.id)
    }).catch(async err => {
      await supabase.from('actions').update({ status: 'failed' }).eq('id', actionId)
      console.error(err)
    })

    const { data: action } = await supabase.from('actions').select('*').eq('id', actionId).single()
    res.json(action)
  } catch (err) { next(err) }
})

export default router
