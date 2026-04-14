import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'outriq.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Schema ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    email      TEXT UNIQUE NOT NULL,
    name       TEXT NOT NULL,
    password   TEXT NOT NULL,
    tier       TEXT DEFAULT 'free',
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

// ── Query helpers ─────────────────────────────────────────────
export const getAll = (sql, params = []) => db.prepare(sql).all(...params)
export const getOne = (sql, params = []) => db.prepare(sql).get(...params)
export const run   = (sql, params = []) => db.prepare(sql).run(...params)

export const transaction = (fn) => db.transaction(fn)()

export default db
