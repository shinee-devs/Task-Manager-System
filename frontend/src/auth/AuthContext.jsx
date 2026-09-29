import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    apiRequest('/auth/session')
      .then((result) => {
        if (active) setUser(result.data.user)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function login(credentials) {
    const result = await apiRequest('/auth/login', { method: 'POST', body: credentials })
    setUser(result.data.user)
    return result.data.user
  }

  async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' })
    setUser(null)
  }

  function updateUser(nextUser) {
    setUser((current) => current ? { ...current, ...nextUser } : current)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) throw new Error('useAuth must be used within AuthProvider')
  return context
}