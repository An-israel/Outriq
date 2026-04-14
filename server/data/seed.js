import 'dotenv/config'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import db, { run, getOne } from '../db.js'

console.log('🌱 Seeding database...')

// Admin user
const userId = uuid()
const hash = await bcrypt.hash('outriq2026', 10)
const existing = getOne('SELECT id FROM users WHERE email = ?', ['aniekaneazy@gmail.com'])
const finalUserId = existing?.id || userId

if (!existing) {
  run('INSERT INTO users (id, email, name, password, tier) VALUES (?,?,?,?,?)',
    [userId, 'aniekaneazy@gmail.com', 'Aniekan Israel', hash, 'growth'])
  console.log('✓ Admin user created — email: aniekaneazy@gmail.com, password: outriq2026')
} else {
  console.log('✓ Admin user already exists')
}

// Products
const PRODUCTS = [
  { id: uuid(), name: 'ChopFit Lagos',      category: 'Food & Fitness',    location: 'Lagos, Nigeria',  description: 'Healthy meal prep and delivery for busy Lagos professionals. Macro-balanced, locally sourced.', target_customer: 'Lagos professionals 25-40 who want to eat healthy', emoji: '🥗', color: '#10b981', match_score: 94 },
  { id: uuid(), name: 'TechFlow Academy',    category: 'Education & Tech',  location: 'Nigeria (Remote)', description: 'Practical coding bootcamps for Nigerian developers — Python, React, DevOps.', target_customer: 'Nigerians 18-35 wanting to break into tech', emoji: '💻', color: '#8b5cf6', match_score: 91 },
  { id: uuid(), name: 'LegalEdge Nigeria',   category: 'Legal Services',    location: 'Abuja, Nigeria',  description: 'Affordable legal services for Nigerian startups — CAC registration, contracts, IP.', target_customer: 'Nigerian entrepreneurs and startups', emoji: '⚖️', color: '#f59e0b', match_score: 87 },
  { id: uuid(), name: 'FitGear Abuja',       category: 'Health & Fitness',  location: 'Abuja, Nigeria',  description: 'Premium home gym equipment for Abuja residents. Setup consultation included.', target_customer: 'Middle-class Abuja residents who want to work out at home', emoji: '🏋️', color: '#ef4444', match_score: 78, status: 'paused' },
  { id: uuid(), name: 'SafeRent Lagos',      category: 'Real Estate',       location: 'Lagos, Nigeria',  description: 'Verified rental listings in Lagos — no agents, no scams, just trusted landlords.', target_customer: 'People looking to rent in Lagos', emoji: '🏠', color: '#06b6d4', match_score: 89 },
]

const pipTemplates = {
  'ChopFit Lagos':    { valueProp: 'Healthy, macro-balanced meal prep delivered to Lagos offices and homes', painPoints: ['No time to cook healthy meals', 'Junk food at every corner', 'Expensive gym diet plans', 'Inconsistent energy from poor nutrition'], searchTerms: ['healthy food delivery Lagos', 'meal prep Lagos', 'healthy lunch Lagos', 'diet food Lagos delivery', 'clean eating Lagos', 'catering Lagos office'], platforms: ['nairaland', 'instagram', 'twitter'], emotionalTriggers: ['health anxiety', 'convenience', 'status', 'energy'] },
  'TechFlow Academy': { valueProp: 'Land your first tech job in 6 months with practical, project-based bootcamps', painPoints: ['Can\'t afford foreign bootcamps', 'Theoretical courses with no jobs', 'No local mentors', 'Imposter syndrome'], searchTerms: ['coding bootcamp Nigeria', 'learn programming Nigeria', 'tech jobs Nigeria', 'Python course Nigeria', 'React developer Nigeria', 'web development course'], platforms: ['twitter', 'nairaland', 'linkedin'], emotionalTriggers: ['career fear', 'income anxiety', 'ambition', 'community'] },
  'LegalEdge Nigeria':{ valueProp: 'Affordable legal protection for Nigerian startups — from CAC to contracts', painPoints: ['Expensive law firms', 'CAC registration confusion', 'Contract disputes', 'IP theft'], searchTerms: ['CAC registration Nigeria', 'startup lawyer Nigeria', 'business registration Nigeria', 'legal services Abuja', 'contracts Nigeria', 'trademark registration Nigeria'], platforms: ['linkedin', 'nairaland', 'twitter'], emotionalTriggers: ['fear of loss', 'legitimacy', 'protection', 'trust'] },
  'FitGear Abuja':    { valueProp: 'Build your dream home gym in Abuja with premium equipment + free setup', painPoints: ['Gym membership costs', 'Traffic to gym', 'No privacy', 'Equipment quality'], searchTerms: ['home gym Abuja', 'gym equipment Abuja', 'dumbbells Abuja', 'treadmill Nigeria', 'home workout equipment', 'fitness equipment Abuja'], platforms: ['instagram', 'twitter', 'nairaland'], emotionalTriggers: ['convenience', 'status', 'privacy', 'consistency'] },
  'SafeRent Lagos':   { valueProp: 'Find verified Lagos rentals without agents — no scams, no hidden fees', painPoints: ['Agent fraud', 'Overpriced rents', 'Unsafe areas', 'Unreliable landlords'], searchTerms: ['house for rent Lagos', 'apartment Lagos', 'flat to let Lagos', 'rent Lagos', 'verified landlords Lagos', 'no agent rent Lagos'], platforms: ['nairaland', 'twitter', 'facebook'], emotionalTriggers: ['security', 'trust', 'savings', 'relief'] },
}

for (const p of PRODUCTS) {
  const exists = getOne('SELECT id FROM products WHERE name = ? AND user_id = ?', [p.name, finalUserId])
  if (!exists) {
    const pip = pipTemplates[p.name] || {}
    run(`INSERT INTO products (id, user_id, name, category, location, description, target_customer, emoji, color, match_score, pip_json, signals_count, actions_count, leads_count, impressions, clicks, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.id, finalUserId, p.name, p.category, p.location, p.description, p.target_customer,
       p.emoji, p.color, p.match_score, JSON.stringify(pip),
       Math.floor(Math.random()*300)+50, Math.floor(Math.random()*100)+20,
       Math.floor(Math.random()*50)+5, Math.floor(Math.random()*15000)+1000,
       Math.floor(Math.random()*1000)+50, p.status || 'active'])
    console.log(`✓ Product: ${p.name}`)
  }
}

// Platform channels
const CHANNELS = [
  { id: 'twitter',   name: 'X / Twitter',    status: 'active',  signals_today: 89,  actions_today: 12, daily_limit: 72,  color: '#60a5fa' },
  { id: 'nairaland', name: 'Nairaland',       status: 'active',  signals_today: 124, actions_today: 8,  daily_limit: 75,  color: '#fb923c' },
  { id: 'reddit',    name: 'Reddit',          status: 'active',  signals_today: 56,  actions_today: 4,  daily_limit: 30,  color: '#f97316' },
  { id: 'linkedin',  name: 'LinkedIn',        status: 'limited', signals_today: 34,  actions_today: 3,  daily_limit: 20,  color: '#3b82f6' },
  { id: 'instagram', name: 'Instagram',       status: 'active',  signals_today: 28,  actions_today: 5,  daily_limit: 0,   color: '#f472b6' },
  { id: 'google',    name: 'Google Search',   status: 'active',  signals_today: 67,  actions_today: 0,  daily_limit: 0,   color: '#93c5fd' },
  { id: 'email',     name: 'Email Outreach',  status: 'active',  signals_today: 0,   actions_today: 8,  daily_limit: 20,  color: '#a78bfa' },
  { id: 'quora',     name: 'Quora',           status: 'active',  signals_today: 21,  actions_today: 2,  daily_limit: 0,   color: '#fca5a5' },
]

for (const ch of CHANNELS) {
  const exists = getOne('SELECT id FROM platform_channels WHERE id = ?', [ch.id])
  if (!exists) {
    run('INSERT INTO platform_channels (id, name, status, signals_today, actions_today, daily_limit, color) VALUES (?,?,?,?,?,?,?)',
      [ch.id, ch.name, ch.status, ch.signals_today, ch.actions_today, ch.daily_limit, ch.color])
    console.log(`✓ Channel: ${ch.name}`)
  }
}

// Distribution modules
const MODULES = [
  { id: 'respond',   name: 'Conversational Response', enabled: 1, description: 'AI replies to intent signals on platforms', color: '#8b5cf6' },
  { id: 'seo',       name: 'SEO Content',              enabled: 1, description: 'Generates SEO articles targeting search terms', color: '#22d3ee' },
  { id: 'geo',       name: 'GEO Optimisation',         enabled: 1, description: 'Optimises for AI-powered search engines', color: '#10b981' },
  { id: 'outreach',  name: 'Email Outreach',           enabled: 1, description: 'Personalised outreach to potential customers', color: '#f59e0b' },
  { id: 'landing',   name: 'Landing Pages',            enabled: 1, description: 'Auto-generates conversion landing pages', color: '#f472b6' },
]

for (const m of MODULES) {
  const exists = getOne('SELECT id FROM distribution_modules WHERE id = ?', [m.id])
  if (!exists) {
    run('INSERT INTO distribution_modules (id, name, enabled, description, color) VALUES (?,?,?,?,?)',
      [m.id, m.name, m.enabled, m.description, m.color])
    console.log(`✓ Module: ${m.name}`)
  }
}

console.log('\n✅ Database seeded successfully!')
console.log('   Login: aniekaneazy@gmail.com / outriq2026')
