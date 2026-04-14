import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

export function useActions({ productId, type, status, limit = 50 } = {}) {
  const [actions, setActions]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetch = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (productId) params.set('productId', productId)
      if (type)      params.set('type', type)
      if (status)    params.set('status', status)
      params.set('limit', limit)

      const data = await api.get(`/actions?${params}`)
      setActions(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [productId, type, status, limit])

  useEffect(() => { fetch() }, [fetch])

  async function distribute(module, payload) {
    return api.post(`/distribute/${module}`, payload)
  }

  return { actions, loading, error, refresh: fetch, distribute }
}
