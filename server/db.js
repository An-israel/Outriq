import Database   from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID }    from 'crypto'
import bcrypt            from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IS_VERCEL = !!process.env.VERCEL
const DB_PATH   = IS_VERCEL ? '/tmp/outriq.db' : join(__dirname, 'outriq.db')

const db = new Database(DB_PATH)
if (!IS_VERCEL) db.pragma('journal_mode = WAL')
// FK constraints are only meaningful with a persistent DB — Vercel /tmp resets on every cold start
if (!IS_VERCEL) db.pragma('foreign_keys = ON')

// ── Schema ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    password        TEXT NOT NULL,
    tier            TEXT DEFAULT 'free',
    email_verified  INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS verify_tokens (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    code       TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used       INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

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
    created_at      TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

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
    created_at     TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

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
    created_at        TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS platform_channels (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    status        TEXT DEFAULT 'active',
    signals_today INTEGER DEFAULT 0,
    actions_today INTEGER DEFAULT 0,
    daily_limit   INTEGER DEFAULT 0,
    color         TEXT DEFAULT '#60a5fa',
    reset_at      TEXT
  );

  CREATE TABLE IF NOT EXISTS distribution_modules (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    enabled     INTEGER DEFAULT 1,
    description TEXT,
    color       TEXT DEFAULT '#8b5cf6'
  );

  CREATE TABLE IF NOT EXISTS performance_snapshots (
    id          TEXT PRIMARY KEY,
    product_id  TEXT,
    date        TEXT NOT NULL,
    signals     INTEGER DEFAULT 0,
    actions     INTEGER DEFAULT 0,
    leads       INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks      INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`)

// Migrate: add email_verified to existing DBs that don't have it
try { db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0") } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'free'") } catch {}

// ── Auto-seed on first run ────────────────────────────────────
function autoSeed() {
  const adminExists = db.prepare("SELECT id FROM users WHERE email = 'aniekaneazy@gmail.com'").get()
  if (adminExists) return

  console.log('🌱 Auto-seeding database...')

  const userId = randomUUID()
  const hash   = bcrypt.hashSync('outriq2026', 10)
  db.prepare('INSERT OR IGNORE INTO users (id, email, name, password, tier, email_verified) VALUES (?,?,?,?,?,?)').run(
    userId, 'aniekaneazy@gmail.com', 'Aniekan Israel', hash, 'growth', 1
  )

  const PRODUCTS = [
    { name: 'ChopFit Lagos',     category: 'Food & Fitness',   location: 'Lagos, Nigeria',   description: 'Healthy meal prep and delivery for busy Lagos professionals. Macro-balanced, locally sourced.', target_customer: 'Lagos professionals 25-40 who want to eat healthy', emoji: '🥗', color: '#10b981', match_score: 94, signals: 287, actions: 89, leads: 34 },
    { name: 'TechFlow Academy',  category: 'Education & Tech', location: 'Nigeria (Remote)', description: 'Practical coding bootcamps for Nigerian developers — Python, React, DevOps.', target_customer: 'Nigerians 18-35 wanting to break into tech', emoji: '💻', color: '#8b5cf6', match_score: 91, signals: 312, actions: 104, leads: 41 },
    { name: 'LegalEdge Nigeria', category: 'Legal Services',   location: 'Abuja, Nigeria',   description: 'Affordable legal services for Nigerian startups — CAC registration, contracts, IP.', target_customer: 'Nigerian entrepreneurs and startups', emoji: '⚖️', color: '#f59e0b', match_score: 87, signals: 198, actions: 67, leads: 22 },
    { name: 'FitGear Abuja',     category: 'Health & Fitness', location: 'Abuja, Nigeria',   description: 'Premium home gym equipment for Abuja residents. Setup consultation included.', target_customer: 'Middle-class Abuja residents who want to work out at home', emoji: '🏋️', color: '#ef4444', match_score: 78, signals: 143, actions: 48, leads: 17, status: 'paused' },
    { name: 'SafeRent Lagos',    category: 'Real Estate',      location: 'Lagos, Nigeria',   description: 'Verified rental listings in Lagos — no agents, no scams, just trusted landlords.', target_customer: 'People looking to rent in Lagos', emoji: '🏠', color: '#06b6d4', match_score: 89, signals: 349, actions: 34, leads: 44 },
  ]

  const PIP = {
    'ChopFit Lagos':    { valueProp: 'Healthy, macro-balanced meal prep delivered to Lagos offices', painPoints: ['No time to cook healthy','Junk food everywhere','Expensive diet plans'], searchTerms: ['healthy food delivery Lagos','meal prep Lagos','clean eating Lagos'], platforms: ['nairaland','instagram','twitter'] },
    'TechFlow Academy': { valueProp: 'Land your first tech job in 6 months with practical bootcamps', painPoints: ["Can't afford foreign bootcamps",'No local mentors'], searchTerms: ['coding bootcamp Nigeria','learn programming Nigeria','tech jobs Nigeria'], platforms: ['twitter','nairaland','linkedin'] },
    'LegalEdge Nigeria':{ valueProp: 'Affordable legal protection for Nigerian startups', painPoints: ['Expensive law firms','CAC confusion'], searchTerms: ['CAC registration Nigeria','startup lawyer Nigeria'], platforms: ['linkedin','nairaland','twitter'] },
    'FitGear Abuja':    { valueProp: 'Build your dream home gym with premium equipment + free setup', painPoints: ['Gym membership costs','Traffic to gym'], searchTerms: ['home gym Abuja','gym equipment Abuja'], platforms: ['instagram','twitter','nairaland'] },
    'SafeRent Lagos':   { valueProp: 'Find verified Lagos rentals without agents', painPoints: ['Agent fraud','Overpriced rents'], searchTerms: ['house for rent Lagos','verified landlords Lagos'], platforms: ['nairaland','twitter','facebook'] },
  }

  const ins = db.prepare(`INSERT OR IGNORE INTO products (id,user_id,name,category,location,description,target_customer,emoji,color,match_score,pip_json,signals_count,actions_count,leads_count,impressions,clicks,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
  for (const p of PRODUCTS) {
    ins.run(randomUUID(), userId, p.name, p.category, p.location, p.description, p.target_customer,
      p.emoji, p.color, p.match_score, JSON.stringify(PIP[p.name] || {}),
      p.signals, p.actions, p.leads,
      Math.floor(Math.random()*15000)+1000, Math.floor(Math.random()*1000)+50, p.status || 'active')
  }

  const CHANNELS = [
    { id: 'twitter',   name: 'X / Twitter',   status: 'active',  signals_today: 89,  actions_today: 12, daily_limit: 72,  color: '#60a5fa' },
    { id: 'nairaland', name: 'Nairaland',      status: 'active',  signals_today: 124, actions_today: 8,  daily_limit: 75,  color: '#fb923c' },
    { id: 'reddit',    name: 'Reddit',         status: 'active',  signals_today: 56,  actions_today: 4,  daily_limit: 30,  color: '#f97316' },
    { id: 'linkedin',  name: 'LinkedIn',       status: 'limited', signals_today: 34,  actions_today: 3,  daily_limit: 20,  color: '#3b82f6' },
    { id: 'instagram', name: 'Instagram',      status: 'active',  signals_today: 28,  actions_today: 5,  daily_limit: 0,   color: '#f472b6' },
    { id: 'google',    name: 'Google Search',  status: 'active',  signals_today: 67,  actions_today: 0,  daily_limit: 0,   color: '#93c5fd' },
    { id: 'email',     name: 'Email Outreach', status: 'active',  signals_today: 0,   actions_today: 8,  daily_limit: 20,  color: '#a78bfa' },
    { id: 'quora',     name: 'Quora',          status: 'active',  signals_today: 21,  actions_today: 2,  daily_limit: 0,   color: '#fca5a5' },
  ]
  const insCh = db.prepare('INSERT OR IGNORE INTO platform_channels (id,name,status,signals_today,actions_today,daily_limit,color) VALUES (?,?,?,?,?,?,?)')
  for (const ch of CHANNELS) insCh.run(ch.id, ch.name, ch.status, ch.signals_today, ch.actions_today, ch.daily_limit, ch.color)

  const MODULES = [
    { id: 'respond',  name: 'Conversational Response', enabled: 1, description: 'AI replies to intent signals on platforms',    color: '#8b5cf6' },
    { id: 'seo',      name: 'SEO Content',              enabled: 1, description: 'Generates SEO articles targeting search terms', color: '#22d3ee' },
    { id: 'geo',      name: 'GEO Optimisation',         enabled: 1, description: 'Optimises for AI-powered search engines',       color: '#10b981' },
    { id: 'outreach', name: 'Email Outreach',           enabled: 1, description: 'Personalised outreach to potential customers',  color: '#f59e0b' },
    { id: 'landing',  name: 'Landing Pages',            enabled: 1, description: 'Auto-generates conversion landing pages',       color: '#f472b6' },
  ]
  const insMod = db.prepare('INSERT OR IGNORE INTO distribution_modules (id,name,enabled,description,color) VALUES (?,?,?,?,?)')
  for (const m of MODULES) insMod.run(m.id, m.name, m.enabled, m.description, m.color)

  const today = new Date().toISOString().split('T')[0]
  db.prepare('INSERT OR IGNORE INTO performance_snapshots (id,product_id,date,signals,actions,leads,impressions,clicks) VALUES (?,NULL,?,?,?,?,?,?)').run(randomUUID(), today, 1289, 342, 158, 48200, 3100)

  console.log('✅ Auto-seed complete')
}

autoSeed()

// ── Query helpers ─────────────────────────────────────────────
export const getAll      = (sql, params = []) => db.prepare(sql).all(...params)
export const getOne      = (sql, params = []) => db.prepare(sql).get(...params)
export const run         = (sql, params = []) => db.prepare(sql).run(...params)
export const transaction = (fn) => db.transaction(fn)()

export default db
