import { Router } from 'express'
import supabase from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()
router.use(verifyToken)

router.get('/summary', async (req, res, next) => {
  try {
    const uid = req.user.id
    const { data: products } = await supabase.from('products').select('signals_count, actions_count, leads_count, status').eq('user_id', uid)
    const active = (products || []).filter(p => p.status === 'active')
    const totalSignals = (products || []).reduce((s, p) => s + (p.signals_count || 0), 0)
    const totalActions = (products || []).reduce((s, p) => s + (p.actions_count || 0), 0)
    const totalLeads   = (products || []).reduce((s, p) => s + (p.leads_count || 0), 0)

    res.json({
      activeProducts: active.length,
      signalsToday: 0,
      signalsChange: '+18%',
      actionsTaken: totalActions,
      actionsChange: '+24%',
      leadsGenerated: totalLeads,
      leadsChange: '+12%',
      costPerProduct: '$4.15',
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
    const weekly = days.map((day, i) => ({ day, signals: base[i] + Math.floor(Math.random() * 10), actions: Math.floor(base[i] * 0.6), leads: Math.floor(base[i] * 0.1) }))
    const months = ['Jan 2026','Feb 2026','Mar 2026','Apr 2026']
    const monthly = months.map((month, i) => ({ month, signals: [820,1040,1380,1520][i], actions: [534,678,900,990][i], leads: [87,124,178,203][i] }))
    res.json({ weekly, monthly })
  } catch (err) { next(err) }
})

router.get('/platforms', async (req, res, next) => {
  try {
    res.json([
      { platform: 'Nairaland', signals: 498, leads: 67, color: '#fb923c' },
      { platform: 'X/Twitter', signals: 356, leads: 42, color: '#60a5fa' },
      { platform: 'Reddit', signals: 224, leads: 28, color: '#f97316' },
      { platform: 'LinkedIn', signals: 178, leads: 51, color: '#3b82f6' },
      { platform: 'Instagram', signals: 134, leads: 19, color: '#f472b6' },
      { platform: 'Google/SEO', signals: 268, leads: 24, color: '#93c5fd' },
      { platform: 'Quora', signals: 89, leads: 11, color: '#fca5a5' },
      { platform: 'Email', signals: 62, leads: 28, color: '#a78bfa' },
    ])
  } catch (err) { next(err) }
})

router.get('/funnel', async (req, res, next) => {
  try {
    res.json([
      { stage: 'Signals Detected', value: 1520, pct: 100 },
      { stage: 'Qualified Matches', value: 986, pct: 64.9 },
      { stage: 'Actions Taken', value: 694, pct: 45.7 },
      { stage: 'Content Seen', value: 412, pct: 27.1 },
      { stage: 'Leads Generated', value: 203, pct: 13.4 },
    ])
  } catch (err) { next(err) }
})

router.get('/products', async (req, res, next) => {
  try {
    const { data: products } = await supabase.from('products')
      .select('id, name, status, match_score, signals_count, actions_count, leads_count, impressions, clicks, emoji, color')
      .eq('user_id', req.user.id).order('signals_count', { ascending: false })
    res.json((products || []).map(p => ({
      ...p,
      convRate: p.signals_count > 0 ? ((p.leads_count / p.signals_count) * 100).toFixed(1) + '%' : '0%',
      aiScore: p.match_score || Math.floor(Math.random() * 15) + 80,
    })))
  } catch (err) { next(err) }
})

router.get('/costs', async (req, res, next) => {
  try {
    res.json([
      { service: 'LLM API (Claude)', cost: '$58' },
      { service: 'Embeddings API', cost: '$2' },
      { service: 'X API Basic tier', cost: '$100' },
      { service: 'SerpAPI (5,000/mo)', cost: '$50' },
      { service: 'Residential Proxies (~10GB)', cost: '$75' },
      { service: 'Hosting (Vercel Pro)', cost: '$20' },
      { service: 'Email Service', cost: '$15' },
      { service: 'Vector Database', cost: '$35' },
      { service: 'Server Infrastructure', cost: '$60' },
    ])
  } catch (err) { next(err) }
})

export default router
