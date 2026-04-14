import { v4 as uuid } from 'uuid'
import { getAll, getOne, run } from '../db.js'
import { simulateSignals } from './claude.service.js'
import { broadcast } from '../websocket.js'

const PLATFORMS = ['nairaland','twitter','reddit','linkedin','instagram','google','quora','email']
const PLATFORM_META = {
  nairaland: { label: 'Nairaland',     key: 'N' },
  twitter:   { label: 'X/Twitter',     key: 'X' },
  reddit:    { label: 'Reddit',        key: 'R' },
  linkedin:  { label: 'LinkedIn',      key: 'L' },
  instagram: { label: 'Instagram',     key: 'I' },
  google:    { label: 'Google Search', key: 'G' },
  quora:     { label: 'Quora',         key: 'Q' },
  email:     { label: 'Email',         key: 'E' },
}

let cycleRunning = false

export async function runCycle() {
  if (cycleRunning) return
  cycleRunning = true

  try {
    // Get all active products across all users
    const products = getAll(`SELECT p.*, u.id as owner_id FROM products p
                              JOIN users u ON u.id = p.user_id
                              WHERE p.status = 'active'`)

    if (products.length === 0) { cycleRunning = false; return }

    console.log(`[Monitor] Running cycle for ${products.length} active products`)

    for (const product of products) {
      // Pick 2 random platforms per cycle to keep it varied
      const selectedPlatforms = PLATFORMS
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)

      for (const platform of selectedPlatforms) {
        const channel = getOne('SELECT * FROM platform_channels WHERE id = ?', [platform])
        if (channel?.status === 'paused') continue

        try {
          const signals = await simulateSignals(product, platform, 1)

          for (const s of signals) {
            if (s.score < 65) continue // filter low relevance

            const id = uuid()
            const meta = PLATFORM_META[platform]

            run(`INSERT INTO signals (id, product_id, platform, platform_label, platform_key, text, signal_type, score)
                 VALUES (?,?,?,?,?,?,?,?)`,
              [id, product.id, platform, meta.label, meta.key, s.text, s.type, s.score])

            run('UPDATE products SET signals_count = signals_count + 1 WHERE id = ?', [product.id])
            run('UPDATE platform_channels SET signals_today = signals_today + 1 WHERE id = ?', [platform])

            const signal = getOne('SELECT * FROM signals WHERE id = ?', [id])
            broadcast({ type: 'new_signal', signal: { ...signal, product_name: product.name } })

            console.log(`[Monitor] Signal — ${product.name} on ${platform}: score ${s.score}`)
          }
        } catch (err) {
          console.error(`[Monitor] Error for ${product.name} on ${platform}:`, err.message)
        }

        // Small delay between platform calls to avoid rate limits
        await new Promise(r => setTimeout(r, 1500))
      }
    }
  } finally {
    cycleRunning = false
  }
}

export function resetDailyCounters() {
  run(`UPDATE platform_channels SET signals_today = 0, actions_today = 0, reset_at = datetime('now')`)
  console.log('[Monitor] Daily counters reset')
}

export async function takeSnapshot() {
  const products = getAll('SELECT * FROM products')
  const today = new Date().toISOString().split('T')[0]

  for (const p of products) {
    const existing = getOne('SELECT id FROM performance_snapshots WHERE product_id = ? AND date = ?', [p.id, today])
    if (!existing) {
      run(`INSERT INTO performance_snapshots (id, product_id, date, signals, actions, leads, impressions, clicks)
           VALUES (?,?,?,?,?,?,?,?)`,
        [uuid(), p.id, today, p.signals_count, p.actions_count, p.leads_count, p.impressions, p.clicks])
    }
  }
  console.log('[Monitor] Daily snapshot saved')
}
