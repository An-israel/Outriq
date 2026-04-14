import cron from 'node-cron'
import { runCycle, resetDailyCounters, takeSnapshot } from './services/monitoring.service.js'

export function startScheduler() {
  // Run monitoring cycle every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Scheduler] Running monitoring cycle...')
    await runCycle()
  })

  // Reset daily counters at midnight
  cron.schedule('0 0 * * *', () => {
    resetDailyCounters()
    takeSnapshot()
  })

  console.log('[Scheduler] Jobs started: monitoring every 5m, daily reset at midnight')
}
