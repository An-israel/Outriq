import { useState, useEffect } from 'react'
import { api, setToken, clearToken, apiFetch } from '../api/client.js'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('outriq_token')
    if (!token) { setLoading(false); return }

    api.get('/auth/me')
      .then(u => { if (u) setUser(u) })
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    // Use apiFetch directly so error fields (needsVerify etc.) are attached to thrown error
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return { user, loading, login, logout }
}
