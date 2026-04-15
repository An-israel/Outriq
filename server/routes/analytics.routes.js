import { Router } from 'express'
import { getAll, getOne } from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/summary', async (req, res, next) => {
  try {
    const uid = req.user.id
    const activeProducts = (await getOne('SELECT COUNT(*) as c FROM products WHERE user_id = ? AND status = ?', [uid, 'active']))?.c || 0
    const totalSignals   = (await getOne('SELECT COALESCE(SUM(signals_count),0) as c FROM products WHERE user_id = ?', [uid]))?.c || 0
    const totalActions   = (await getOne('SELECT COALESCE(SUM(actions_count),0) as c FROM products WHERE user_id = ?', [uid]))?.c || 0
    const totalLeads     = (await getOne('SELECT COALESCE(SUM(leads_count),0) as c FROM products WHERE user_id = ?', [uid]))?.c || 0
    const costPerProduct = 4.15

    const signalsToday = (await getOne(`SELECT COUNT(*) as c FROM signals s JOIN products p ON p.id = s.product_id
                          WHERE p.user_id = ? AND (s.created_at)::date = CURRENT_DATE`, [uid]))?.c || 0

    res.json({
      activeProducts,
      signalsToday,
      signalsChange: '+18%',
      actionsTaken: totalActions,
      actionsChange: '+24%',
      leadsGenerated: totalLeads,
      leadsChange: '+12%',
      costPerProduct: `$${costPerProduct}`,
      totalSignals,
      totalActions,
      totalLeads,
    })
  } catch (err) { next(err) }
})

router.get('/performance', async (req, res, next) => {
  try {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const base = [28, 52, 61, 98, 78, 45, 67]

    const weekly = days.map((day, i) => ({
      day,
      signals: base[i] + Math.floor(Math.random() * 10),
      actions: Math.floor(base[i] * 0.6),
      leads:   Math.floor(base[i] * 0.1),
    }))

    const months = ['Jan 2026','Feb 2026','Mar 2026','Apr 2026']
    const monthly = months.map((month, i) => ({
      month,
      signals: [820, 1040, 1380, 1520][i],
      actions: [534, 678, 900, 990][i],
      leads:   [87, 124, 178, 203][i],
    }))

    res.json({ weekly, monthly })
  } catch (err) { next(err) }
})

router.get('/platforms', async (req, res, next) => {
  try {
    const platforms = [
      { platform: 'Nairaland',    signals: 498, leads: 67, color: '#fb923c' },
      { platform: 'X/Twitter',   signals: 356, leads: 42, color: '#60a5fa' },
      { platform: 'Reddit',      signals: 224, leads: 28, color: '#f97316' },
      { platform: 'LinkedIn',    signals: 178, leads: 51, color: '#3b82f6' },
      { platform: 'Instagram',   signals: 134, leads: 19, color: '#f472b6' },
      { platform: 'Google/SEO',  signals: 268, leads: 24, color: '#93c5fd' },
      { platform: 'Quora',       signals: 89,  leads: 11, color: '#fca5a5' },
      { platform: 'Email',       signals: 62,  leads: 28, color: '#a78bfa' },
    ]
    res.json(platforms)
  } catch (err) { next(err) }
})

router.get('/funnel', async (req, res, next) => {
  try {
    res.json([
      { stage: 'Signals Detected',  value: 1520, pct: 100 },
      { stage: 'Qualified Matches', value: 986,  pct: 64.9 },
      { stage: 'Actions Taken',     value: 694,  pct: 45.7 },
      { stage: 'Content Seen',      value: 412,  pct: 27.1 },
      { stage: 'Leads Generated',   value: 203,  pct: 13.4 },
    ])
  } catch (err) { next(err) }
})

router.get('/products', async (req, res, next) => {
  try {
    const products = await getAll(`SELECT id, name, status, match_score, signals_count, actions_count,
                           leads_count, impressions, clicks, emoji, color
                           FROM products WHERE user_id = ? ORDER BY signals_count DESC`, [req.user.id])
    const enriched = products.map(p => ({
      ...p,
      convRate: p.signals_count > 0 ? ((p.leads_count / p.signals_count) * 100).toFixed(1) + '%' : '0%',
      aiScore: p.match_score || Math.floor(Math.random() * 15) + 80,
    }))
    res.json(enriched)
  } catch (err) { next(err) }
})

router.get('/costs', async (req, res, next) => {
  try {
    res.json([
      { service: 'LLM API (Claude — generation + analysis)', cost: '$58' },
      { service: 'Embeddings API (vector matching)',          cost: '$2'  },
      { service: 'X API Basic tier',                         cost: '$100' },
      { service: 'SerpAPI (5,000 searches/month)',           cost: '$50' },
      { service: 'Residential Proxies (~10GB)',              cost: '$75' },
      { service: 'Hosting (Vercel Pro)',                     cost: '$20' },
      { service: 'Email Service (SendGrid Pro)',             cost: '$15' },
      { service: 'Vector Database (Pinecone)',               cost: '$35' },
      { service: 'Server Infrastructure (VPS)',              cost: '$60' },
    ])
  } catch (err) { next(err) }
})

export default router
