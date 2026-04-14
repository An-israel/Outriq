import { useState, useEffect, useCallback, useRef } from 'react'
import { api, connectWebSocket } from '../api/client.js'

export function useSignals({ productId, platform, type, limit = 50 } = {}) {
  const [signals, setSignals]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [live, setLive]         = useState(false)

  const fetch = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (productId) params.set('productId', productId)
      if (platform)  params.set('platform', platform)
      if (type)      params.set('type', type)
      params.set('limit', limit)

      const data = await api.get(`/signals?${params}`)
      setSignals(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [productId, platform, type, limit])

  useEffect(() => { fetch() }, [fetch])

  // WebSocket live feed
  useEffect(() => {
    const cleanup = connectWebSocket((msg) => {
      if (msg.type === 'new_signal') {
        setLive(true)
        setSignals(prev => {
          const updated = [{ ...msg.signal, time: 'just now' }, ...prev]
          return updated.slice(0, limit)
        })
        setTimeout(() => setLive(false), 2000)
      }
    })
    return cleanup || undefined
  }, [limit])

  async function simulateSignals(pId, count = 5) {
    const data = await api.post('/signals/simulate', { productId: pId, count })
    await fetch()
    return data
  }

  async function actOnSignal(signalId, actionType = 'respond') {
    return api.post(`/signals/${signalId}/act`, { type: actionType })
  }

  return { signals, loading, error, live, refresh: fetch, simulateSignals, actOnSignal }
}
