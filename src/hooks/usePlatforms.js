import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

export function usePlatforms() {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading]     = useState(true)

  const fetch = useCallback(async () => {
    try {
      const data = await api.get('/platforms')
      setPlatforms(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function updatePlatform(id, updates) {
    const p = await api.patch(`/platforms/${id}`, updates)
    setPlatforms(prev => prev.map(x => x.id === id ? p : x))
  }

  return { platforms, loading, updatePlatform, refresh: fetch }
}
