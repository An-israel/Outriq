import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jpatmctrzkrcquueqncu.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Helper: throw on error, return data
export function check({ data, error, count }) {
  if (error) throw new Error(error.message)
  return data
}

// Auto-seed admin + demo data on first use
let seeded = false
export async function ensureSeeded() {
  if (seeded) return
  seeded = true
  try {
    const { data } = await supabase.from('users').select('id').eq('email', 'aniekaneazy@gmail.com').maybeSingle()
    if (data) return

    console.log('🌱 Auto-seeding database...')
    const { randomUUID } = await import('crypto')
    const bcrypt = await import('bcryptjs')

    const userId = randomUUID()
    const hash = bcrypt.default.hashSync('outriq2026', 10)
    await supabase.from('users').insert({ id: userId, email: 'aniekaneazy@gmail.com', name: 'Aniekan Israel', password: hash, tier: 'growth', email_verified: 1 })

    const PRODUCTS = [
      { name: 'ChopFit Lagos', category: 'Food & Fitness', location: 'Lagos, Nigeria', description: 'Healthy meal prep and delivery for busy Lagos professionals.', target_customer: 'Lagos professionals 25-40', emoji: '🥗', color: '#10b981', match_score: 94, signals_count: 287, actions_count: 89, leads_count: 34 },
      { name: 'TechFlow Academy', category: 'Education & Tech', location: 'Nigeria (Remote)', description: 'Practical coding bootcamps for Nigerian developers.', target_customer: 'Nigerians 18-35 wanting tech jobs', emoji: '💻', color: '#8b5cf6', match_score: 91, signals_count: 312, actions_count: 104, leads_count: 41 },
      { name: 'LegalEdge Nigeria', category: 'Legal Services', location: 'Abuja, Nigeria', description: 'Affordable legal services for Nigerian startups.', target_customer: 'Nigerian entrepreneurs', emoji: '⚖️', color: '#f59e0b', match_score: 87, signals_count: 198, actions_count: 67, leads_count: 22 },
      { name: 'FitGear Abuja', category: 'Health & Fitness', location: 'Abuja, Nigeria', description: 'Premium home gym equipment for Abuja residents.', target_customer: 'Middle-class Abuja residents', emoji: '🏋️', color: '#ef4444', match_score: 78, signals_count: 143, actions_count: 48, leads_count: 17, status: 'paused' },
      { name: 'SafeRent Lagos', category: 'Real Estate', location: 'Lagos, Nigeria', description: 'Verified rental listings in Lagos.', target_customer: 'People looking to rent in Lagos', emoji: '🏠', color: '#06b6d4', match_score: 89, signals_count: 349, actions_count: 34, leads_count: 44 },
    ]
    for (const p of PRODUCTS) {
      await supabase.from('products').insert({
        id: randomUUID(), user_id: userId, name: p.name, category: p.category, location: p.location,
        description: p.description, target_customer: p.target_customer, emoji: p.emoji, color: p.color,
        match_score: p.match_score, pip_json: '{}', signals_count: p.signals_count, actions_count: p.actions_count,
        leads_count: p.leads_count, impressions: Math.floor(Math.random() * 15000) + 1000,
        clicks: Math.floor(Math.random() * 1000) + 50, status: p.status || 'active'
      })
    }

    const CHANNELS = [
      { id: 'twitter', name: 'X / Twitter', status: 'active', signals_today: 89, actions_today: 12, daily_limit: 72, color: '#60a5fa' },
      { id: 'nairaland', name: 'Nairaland', status: 'active', signals_today: 124, actions_today: 8, daily_limit: 75, color: '#fb923c' },
      { id: 'reddit', name: 'Reddit', status: 'active', signals_today: 56, actions_today: 4, daily_limit: 30, color: '#f97316' },
      { id: 'linkedin', name: 'LinkedIn', status: 'limited', signals_today: 34, actions_today: 3, daily_limit: 20, color: '#3b82f6' },
      { id: 'instagram', name: 'Instagram', status: 'active', signals_today: 28, actions_today: 5, daily_limit: 0, color: '#f472b6' },
      { id: 'google', name: 'Google Search', status: 'active', signals_today: 67, actions_today: 0, daily_limit: 0, color: '#93c5fd' },
      { id: 'email', name: 'Email Outreach', status: 'active', signals_today: 0, actions_today: 8, daily_limit: 20, color: '#a78bfa' },
      { id: 'quora', name: 'Quora', status: 'active', signals_today: 21, actions_today: 2, daily_limit: 0, color: '#fca5a5' },
    ]
    for (const ch of CHANNELS) await supabase.from('platform_channels').upsert(ch)

    const MODULES = [
      { id: 'seo', name: 'SEO Content', enabled: 1, description: 'Generates SEO articles', color: '#22d3ee' },
      { id: 'geo', name: 'GEO Optimisation', enabled: 1, description: 'Optimises for AI search engines', color: '#10b981' },
      { id: 'landing', name: 'Landing Pages', enabled: 1, description: 'Auto-generates landing pages', color: '#f472b6' },
    ]
    for (const m of MODULES) await supabase.from('distribution_modules').upsert(m)

    console.log('✅ Auto-seed complete')
  } catch (err) {
    console.error('⚠️ Seed error (non-fatal):', err.message)
  }
}

// Kick off seed on import
ensureSeeded()

export default supabase
