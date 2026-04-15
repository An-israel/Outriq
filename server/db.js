import postgres from 'postgres'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required. Get it from Supabase: Settings → Database → Connection string (URI)')
  process.exit(1)
}

const sql = postgres({
  host: 'db.jpatmctrzkrcquueqncu.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'Aniekan@25%',
  ssl: 'require',
  max: 3,
  idle_timeout: 20,
  connect_timeout: 10,
})

// ── SQLite → PostgreSQL query converter ──────────────────────
function convert(query) {
  let q = query
    .replace(/datetime\('now'\)/gi, 'now()')
    .replace(/date\('now'\)/gi, 'CURRENT_DATE')
    .replace(/date\((\w+(?:\.\w+)?)\)/gi, '($1)::date')
    .replace(/COUNT\(\*\)/gi, 'COUNT(*)::integer')
    .replace(/SUM\((\w+(?:\.\w+)?)\)/gi, 'SUM($1)::integer')

  const hasIgnore = /INSERT\s+OR\s+IGNORE/i.test(q)
  if (hasIgnore) q = q.replace(/INSERT\s+OR\s+IGNORE/gi, 'INSERT')

  let i = 0
  q = q.replace(/\?/g, () => `$${++i}`)

  if (hasIgnore) q += ' ON CONFLICT DO NOTHING'

  return q
}

// ── Schema ───────────────────────────────────────────────────
async function createTables() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id              TEXT PRIMARY KEY,
      email           TEXT UNIQUE NOT NULL,
      name            TEXT NOT NULL,
      password        TEXT NOT NULL,
      tier            TEXT DEFAULT 'free',
      email_verified  INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT now()
    )
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS verify_tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      code       TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used       INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS products (
      id              TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      name            TEXT NOT NULL,
      category        TEXT NOT NULL,
      location        TEXT NOT NULL,
      description     TEXT NOT NULL,
      target_customer TEXT,
      website         TEXT,
      status          TEXT DEFAULT 'active',
      emoji           TEXT DEFAULT '📦',
      color           TEXT DEFAULT '#8b5cf6',
      pip_json        TEXT,
      match_score     INTEGER DEFAULT 0,
      signals_count   INTEGER DEFAULT 0,
      actions_count   INTEGER DEFAULT 0,
      leads_count     INTEGER DEFAULT 0,
      impressions     INTEGER DEFAULT 0,
      clicks          INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT now()
    )
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS signals (
      id             TEXT PRIMARY KEY,
      product_id     TEXT NOT NULL,
      platform       TEXT NOT NULL,
      platform_label TEXT NOT NULL,
      platform_key   TEXT NOT NULL,
      text           TEXT NOT NULL,
      signal_type    TEXT NOT NULL,
      score          INTEGER NOT NULL,
      url            TEXT,
      acted_upon     INTEGER DEFAULT 0,
      action_id      TEXT,
      created_at     TIMESTAMPTZ DEFAULT now()
    )
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS actions (
      id                TEXT PRIMARY KEY,
      product_id        TEXT NOT NULL,
      signal_id         TEXT,
      type              TEXT NOT NULL,
      platform          TEXT,
      title             TEXT NOT NULL,
      description       TEXT,
      generated_content TEXT,
      status            TEXT DEFAULT 'processing',
      clicks            INTEGER DEFAULT 0,
      impressions       INTEGER DEFAULT 0,
      created_at        TIMESTAMPTZ DEFAULT now()
    )
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS platform_channels (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      status        TEXT DEFAULT 'active',
      signals_today INTEGER DEFAULT 0,
      actions_today INTEGER DEFAULT 0,
      daily_limit   INTEGER DEFAULT 0,
      color         TEXT DEFAULT '#60a5fa',
      reset_at      TIMESTAMPTZ
    )
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS distribution_modules (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      enabled     INTEGER DEFAULT 1,
      description TEXT,
      color       TEXT DEFAULT '#8b5cf6'
    )
  `)
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS performance_snapshots (
      id          TEXT PRIMARY KEY,
      product_id  TEXT,
      date        TEXT NOT NULL,
      signals     INTEGER DEFAULT 0,
      actions     INTEGER DEFAULT 0,
      leads       INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      clicks      INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `)
}

// ── Auto-seed on first run ───────────────────────────────────
async function autoSeed() {
  await createTables()

  const rows = await sql.unsafe("SELECT id FROM users WHERE email = 'aniekaneazy@gmail.com'")
  if (rows.length > 0) return

  console.log('🌱 Auto-seeding database...')

  const userId = randomUUID()
  const hash = bcrypt.hashSync('outriq2026', 10)
  await sql.unsafe(
    'INSERT INTO users (id, email, name, password, tier, email_verified) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',
    [userId, 'aniekaneazy@gmail.com', 'Aniekan Israel', hash, 'growth', 1]
  )

  const PRODUCTS = [
    { name: 'ChopFit Lagos', category: 'Food & Fitness', location: 'Lagos, Nigeria', description: 'Healthy meal prep and delivery for busy Lagos professionals. Macro-balanced, locally sourced.', target_customer: 'Lagos professionals 25-40 who want to eat healthy', emoji: '🥗', color: '#10b981', match_score: 94, signals: 287, actions: 89, leads: 34 },
    { name: 'TechFlow Academy', category: 'Education & Tech', location: 'Nigeria (Remote)', description: 'Practical coding bootcamps for Nigerian developers — Python, React, DevOps.', target_customer: 'Nigerians 18-35 wanting to break into tech', emoji: '💻', color: '#8b5cf6', match_score: 91, signals: 312, actions: 104, leads: 41 },
    { name: 'LegalEdge Nigeria', category: 'Legal Services', location: 'Abuja, Nigeria', description: 'Affordable legal services for Nigerian startups — CAC registration, contracts, IP.', target_customer: 'Nigerian entrepreneurs and startups', emoji: '⚖️', color: '#f59e0b', match_score: 87, signals: 198, actions: 67, leads: 22 },
    { name: 'FitGear Abuja', category: 'Health & Fitness', location: 'Abuja, Nigeria', description: 'Premium home gym equipment for Abuja residents. Setup consultation included.', target_customer: 'Middle-class Abuja residents who want to work out at home', emoji: '🏋️', color: '#ef4444', match_score: 78, signals: 143, actions: 48, leads: 17, status: 'paused' },
    { name: 'SafeRent Lagos', category: 'Real Estate', location: 'Lagos, Nigeria', description: 'Verified rental listings in Lagos — no agents, no scams, just trusted landlords.', target_customer: 'People looking to rent in Lagos', emoji: '🏠', color: '#06b6d4', match_score: 89, signals: 349, actions: 34, leads: 44 },
  ]

  for (const p of PRODUCTS) {
    await sql.unsafe(
      'INSERT INTO products (id,user_id,name,category,location,description,target_customer,emoji,color,match_score,pip_json,signals_count,actions_count,leads_count,impressions,clicks,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) ON CONFLICT DO NOTHING',
      [randomUUID(), userId, p.name, p.category, p.location, p.description, p.target_customer, p.emoji, p.color, p.match_score, '{}', p.signals, p.actions, p.leads, Math.floor(Math.random() * 15000) + 1000, Math.floor(Math.random() * 1000) + 50, p.status || 'active']
    )
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
  for (const ch of CHANNELS) {
    await sql.unsafe(
      'INSERT INTO platform_channels (id,name,status,signals_today,actions_today,daily_limit,color) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',
      [ch.id, ch.name, ch.status, ch.signals_today, ch.actions_today, ch.daily_limit, ch.color]
    )
  }

  const MODULES = [
    { id: 'respond', name: 'Conversational Response', enabled: 1, description: 'AI replies to intent signals on platforms', color: '#8b5cf6' },
    { id: 'seo', name: 'SEO Content', enabled: 1, description: 'Generates SEO articles targeting search terms', color: '#22d3ee' },
    { id: 'geo', name: 'GEO Optimisation', enabled: 1, description: 'Optimises for AI-powered search engines', color: '#10b981' },
    { id: 'outreach', name: 'Email Outreach', enabled: 1, description: 'Personalised outreach to potential customers', color: '#f59e0b' },
    { id: 'landing', name: 'Landing Pages', enabled: 1, description: 'Auto-generates conversion landing pages', color: '#f472b6' },
  ]
  for (const m of MODULES) {
    await sql.unsafe(
      'INSERT INTO distribution_modules (id,name,enabled,description,color) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [m.id, m.name, m.enabled, m.description, m.color]
    )
  }

  const today = new Date().toISOString().split('T')[0]
  await sql.unsafe(
    'INSERT INTO performance_snapshots (id,product_id,date,signals,actions,leads,impressions,clicks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',
    [randomUUID(), null, today, 1289, 342, 158, 48200, 3100]
  )

  console.log('✅ Auto-seed complete')
}

const seedPromise = autoSeed().catch(err => console.error('❌ DB init error:', err.message))

// ── Query helpers (async, auto-converts SQLite syntax) ───────
export async function getAll(query, params = []) {
  await seedPromise
  return sql.unsafe(convert(query), params)
}

export async function getOne(query, params = []) {
  await seedPromise
  const rows = await sql.unsafe(convert(query), params)
  return rows[0] || null
}

export async function run(query, params = []) {
  await seedPromise
  return sql.unsafe(convert(query), params)
}

export default sql
