import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { getAll, getOne, run } from '../db.js'
import { verifyToken } from '../middleware/auth.js'
import {
  generateResponse, generateSEOArticle, generateGEO,
  generateOutreach, generateLandingPage
} from '../services/claude.service.js'

const router = Router()
router.use(verifyToken)

async function getProduct(productId, userId) {
  return getOne('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId])
}

async function createAction(productId, signalId, type, platform, title, desc) {
  const id = uuid()
  await run(`INSERT INTO actions (id, product_id, signal_id, type, platform, title, description, status)
       VALUES (?,?,?,?,?,?,?,'processing')`, [id, productId, signalId || null, type, platform || null, title, desc])
  return id
}

async function finishAction(id, content) {
  await run('UPDATE actions SET generated_content = ?, status = ? WHERE id = ?', [content, 'success', id])
  return getOne('SELECT * FROM actions WHERE id = ?', [id])
}

router.post('/respond', async (req, res, next) => {
  try {
    const { productId, signalId } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const signal = signalId ? await getOne('SELECT * FROM signals WHERE id = ?', [signalId]) : null
    const fakeSignal = signal || { text: req.body.signalText || 'How can this product help me?', platform: 'twitter', platform_label: 'X/Twitter' }

    const actionId = await createAction(productId, signalId, 'respond', fakeSignal.platform,
      `Response posted on ${fakeSignal.platform_label || 'Platform'}`,
      `AI-crafted reply to: "${fakeSignal.text?.slice(0, 60)}..."`)

    const content = await generateResponse(fakeSignal, product)
    const action = await finishAction(actionId, content)
    await run('UPDATE products SET actions_count = actions_count + 1 WHERE id = ?', [productId])
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

    const actionId = await createAction(productId, null, 'content', null,
      `SEO Article: "${kw}"`, `1,500-word SEO article targeting "${kw}"`)

    const content = await generateSEOArticle(product, kw)
    const action = await finishAction(actionId, content)
    await run('UPDATE products SET actions_count = actions_count + 1 WHERE id = ?', [productId])
    res.json({ action, content })
  } catch (err) { next(err) }
})

router.post('/geo', async (req, res, next) => {
  try {
    const { productId } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const actionId = await createAction(productId, null, 'geo', null,
      `GEO Optimisation — ${product.name}`, 'Schema markup + AI-search descriptions')

    const geoData = await generateGEO(product)
    const content = JSON.stringify(geoData, null, 2)
    const action = await finishAction(actionId, content)
    await run('UPDATE products SET actions_count = actions_count + 1 WHERE id = ?', [productId])
    res.json({ action, ...geoData })
  } catch (err) { next(err) }
})

router.post('/outreach', async (req, res, next) => {
  try {
    const { productId, prospectContext } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const actionId = await createAction(productId, null, 'outreach', 'email',
      `Email outreach — ${product.name}`, `Personalised outreach: ${prospectContext || 'general prospect'}`)

    const content = await generateOutreach(product, prospectContext)
    const action = await finishAction(actionId, content)
    await run('UPDATE products SET actions_count = actions_count + 1 WHERE id = ?', [productId])
    await run('UPDATE platform_channels SET actions_today = actions_today + 1 WHERE id = ?', ['email'])
    res.json({ action, content })
  } catch (err) { next(err) }
})

router.post('/landing', async (req, res, next) => {
  try {
    const { productId } = req.body
    const product = await getProduct(productId, req.user.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const actionId = await createAction(productId, null, 'landing', null,
      `Landing page — ${product.name}`, 'AI-generated conversion landing page')

    const content = await generateLandingPage(product)
    const action = await finishAction(actionId, content)
    await run('UPDATE products SET actions_count = actions_count + 1 WHERE id = ?', [productId])
    res.json({ action, content })
  } catch (err) { next(err) }
})

router.get('/modules', async (req, res, next) => {
  try {
    const modules = await getAll('SELECT * FROM distribution_modules ORDER BY id')
    res.json(modules)
  } catch (err) { next(err) }
})

router.patch('/modules/:id', async (req, res, next) => {
  try {
    const { enabled } = req.body
    await run('UPDATE distribution_modules SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, req.params.id])
    res.json(await getOne('SELECT * FROM distribution_modules WHERE id = ?', [req.params.id]))
  } catch (err) { next(err) }
})

export default router
