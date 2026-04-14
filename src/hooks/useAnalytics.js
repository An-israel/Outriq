import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

export function useAnalytics() {
  const [summary, setSummary]           = useState(null)
  const [performance, setPerformance]   = useState(null)
  const [platforms, setPlatforms]       = useState([])
  const [funnel, setFunnel]             = useState([])
  const [products, setProducts]         = useState([])
  const [costs, setCosts]               = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/performance'),
      api.get('/analytics/platforms'),
      api.get('/analytics/funnel'),
      api.get('/analytics/products'),
      api.get('/analytics/costs'),
    ]).then(([s, perf, plat, fun, prods, c]) => {
      setSummary(s)
      setPerformance(perf)
      setPlatforms(plat)
      setFunnel(fun)
      setProducts(prods)
      setCosts(c)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  return { summary, performance, platforms, funnel, products, costs, loading }
}
