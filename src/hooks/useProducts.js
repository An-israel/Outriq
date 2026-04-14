import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get('/products')
      setProducts(data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createProduct(form) {
    const p = await api.post('/products', form)
    setProducts(prev => [p, ...prev])
    return p
  }

  async function updateProduct(id, updates) {
    const p = await api.patch(`/products/${id}`, updates)
    setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))
    return p
  }

  async function deleteProduct(id) {
    await api.delete(`/products/${id}`)
    setProducts(prev => prev.filter(x => x.id !== id))
  }

  return { products, loading, error, createProduct, updateProduct, deleteProduct, refresh: fetch }
}
