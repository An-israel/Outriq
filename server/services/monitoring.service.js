import { v4 as uuid } from 'uuid'
import supabase from '../db.js'
import { simulateSignals } from './claude.service.js'
import { broadcast } from '../websocket.js'

const PLATFORMS = ['nairaland','twitter','reddit','linkedin','instagram','google','quora','email']
const PLATFORM_META = {
  nairaland: { label: 'Nairaland', key: 'N' }, twitter: { label: 'X/Twitter', key: 'X' },
  reddit: { label: 'Reddit', key: 'R' }, linkedin: { label: 'LinkedIn', key: 'L' },
  instagram: { label: 'Instagram', key: 'I' }, google: { label: 'Google Search', key: 'G' },
  quora: { label: 'Quora', key: 'Q' }, email: { label: 'Email', key: 'E' },
}

let cycleRunning = false

export async function runCycle() {
  if (cycleRunning) return
  cycleRunning = true

  try {
    const { data: products } = await supabase.from('products').select('*').eq('status', 'active')
    if (!products?.length) { cycleRunning = false; return }

    console.log(`[Monitor] Running cycle for ${products.length} active products`)

    for (const product of products) {
      const selectedPlatforms = PLATFORMS.sort(() => Math.random() - 0.5).slice(0, 2)

      for (const platform of selectedPlatforms) {
        const { data: channel } = await supabase.from('platform_channels').select('status').eq('id', platform).maybeSingle()
        if (channel?.status === 'paused') continue

        try {
          const signals = await simulateSignals(product, platform, 1)
          for (const s of signals) {
            if (s.score < 65) continue
            const id = uuid()
            const meta = PLATFORM_META[platform]
            await supabase.from('signals').insert({ id, product_id: product.id, platform, platform_label: meta.label, platform_key: meta.key, text: s.text, signal_type: s.type, score: s.score })
            await supabase.from('products').update({ signals_count: (product.signals_count || 0) + 1 }).eq('id', product.id)

            const { data: signal } = await supabase.from('signals').select('*').eq('id', id).single()
            broadcast({ type: 'new_signal', signal: { ...signal, product_name: product.name } })
            console.log(`[Monitor] Signal — ${product.name} on ${platform}: score ${s.score}`)
          }
        } catch (err) {
          console.error(`[Monitor] Error for ${product.name} on ${platform}:`, err.message)
        }
        await new Promise(r => setTimeout(r, 1500))
      }
    }
  } finally { cycleRunning = false }
}

export async function resetDailyCounters() {
  await supabase.from('platform_channels').update({ signals_today: 0, actions_today: 0 }).neq('id', '')
  console.log('[Monitor] Daily counters reset')
}

export async function takeSnapshot() {
  const { data: products } = await supabase.from('products').select('*')
  const today = new Date().toISOString().split('T')[0]
  for (const p of (products || [])) {
    const { data: existing } = await supabase.from('performance_snapshots').select('id').eq('product_id', p.id).eq('date', today).maybeSingle()
    if (!existing) {
      await supabase.from('performance_snapshots').insert({ id: uuid(), product_id: p.id, date: today, signals: p.signals_count, actions: p.actions_count, leads: p.leads_count, impressions: p.impressions, clicks: p.clicks })
    }
  }
  console.log('[Monitor] Daily snapshot saved')
}
