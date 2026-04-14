import { useState, useEffect } from 'react'
import { api, setToken, clearToken } from '../api/client.js'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('outriq_token')
    if (!token) { setLoading(false); return }

    api.get('/auth/me')
      .then(u => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    setError(null)
    const data = await api.post('/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(name, email, password) {
    setError(null)
    const data = await api.post('/auth/register', { name, email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return { user, loading, error, login, register, logout }
}
