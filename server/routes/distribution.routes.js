import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import supabase, { check } from '../db.js'
import { verifyToken } from '../middleware/auth.js'
import { generateResponse, generateSEOArticle, generateGEO, generateOutreach, generateLandingPage } from '../services/claude.service.js'

const router = Router()
router.use(verifyToken)

async function getProduct(productId, userId) {
  const { data } = await supabase.from('products').select('*').eq('id', productId).eq('user_id', userId).maybeSingle()
  return data
}

async function createAction(productId, signalId, type, platform, title, desc) {
  const id = uuid()
  check(await supabase.from('actions').insert({ id, product_id: productId, signal_id: signalId || null, type, platform: platform || null, title, description: desc, status: 'processing' }))
  return id
}

async function finishAction(id, content) {
  check(await supabase.from('actions').update({ generated_content: content, status: 'success' }).eq('id', id))
  const { data } = await supabase.from('actions').select('*').eq('id', id).single()
  return data
}

async function incrementActions(productId) {
  const { data: p } = await supabase.from('products').select('actions_count').eq('id', productId).single()
  await supabase.from('products').update({ actions_count: (p?.actions_count || 0) + 1 }).eq('id', productId)
}

router.post('/respond', async (req, res, next) => {
  try {
    const { productId, signalId } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    let signal = null
    if (signalId) { const { data } = await supabase.from('signals').select('*').eq('id', signalId).maybeSingle(); signal = data }
    const fakeSignal = signal || { text: req.body.signalText || 'How can this product help me?', platform: 'twitter', platform_label: 'X/Twitter' }

    const actionId = await createAction(productId, signalId, 'respond', fakeSignal.platform, `Response posted on ${fakeSignal.platform_label || 'Platform'}`, `AI reply to: "${fakeSignal.text?.slice(0, 60)}..."`)
    const content = await generateResponse(fakeSignal, product)
    const action = await finishAction(actionId, content)
    await incrementActions(productId)
    res.json({ action, content })
  } catch (err) { next(err) }
})

router.post('/seo', async (req, res, next) => {
  try {
    const { productId, keyword } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const pip = product.pip_json ? JSON.parse(product.pip_json) : {}
    const kw = keyword || pip.searchTerms?.[0] || product.name
    const actionId = await createAction(productId, null, 'content', null, `SEO Article: "${kw}"`, `1,500-word article targeting "${kw}"`)
    const content = await generateSEOArticle(product, kw)
    const action = await finishAction(actionId, content)
    await incrementActions(productId)
    res.json({ action, content })
  } catch (err) { next(err) }
})

router.post('/geo', async (req, res, next) => {
  try {
    const { productId } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const actionId = await createAction(productId, null, 'geo', null, `GEO Optimisation — ${product.name}`, 'Schema markup + AI-search descriptions')
    const geoData = await generateGEO(product)
    const action = await finishAction(actionId, JSON.stringify(geoData, null, 2))
    await incrementActions(productId)
    res.json({ action, ...geoData })
  } catch (err) { next(err) }
})

router.post('/outreach', async (req, res, next) => {
  try {
    const { productId, prospectContext } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const actionId = await createAction(productId, null, 'outreach', 'email', `Email outreach — ${product.name}`, `Outreach: ${prospectContext || 'general'}`)
    const content = await generateOutreach(product, prospectContext)
    const action = await finishAction(actionId, content)
    await incrementActions(productId)
    res.json({ action, content })
  } catch (err) { next(err) }
})

router.post('/landing', async (req, res, next) => {
  try {
    const { productId } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const actionId = await createAction(productId, null, 'landing', null, `Landing page — ${product.name}`, 'AI-generated landing page')
    const content = await generateLandingPage(product)
    const action = await finishAction(actionId, content)
    await incrementActions(productId)
    res.json({ action, content })
  } catch (err) { next(err) }
})

router.get('/modules', async (req, res, next) => {
  try {
    const { data } = await supabase.from('distribution_modules').select('*').order('id')
    res.json(data || [])
  } catch (err) { next(err) }
})

router.patch('/modules/:id', async (req, res, next) => {
  try {
    const { enabled } = req.body
    check(await supabase.from('distribution_modules').update({ enabled: enabled ? 1 : 0 }).eq('id', req.params.id))
    const { data } = await supabase.from('distribution_modules').select('*').eq('id', req.params.id).single()
    res.json(data)
  } catch (err) { next(err) }
})

export default router
