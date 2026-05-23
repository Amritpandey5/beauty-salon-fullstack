import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { setAccessToken, clearAccessToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while checking session on mount

  // On mount: try to restore session via refresh token cookie
  useEffect(() => {
    const restore = async () => {
      try {
        // hit /auth/refresh — if cookie is valid it returns a new access token
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { method: 'POST', credentials: 'include' }
        )
        if (res.ok) {
          const data = await res.json()
          setAccessToken(data.data.accessToken)
          const meRes = await authApi.getMe()
          setUser(meRes.data.user)
        }
      } catch (err) {
        console.error("Auth restore failed:", err)
      } finally {
        setLoading(false)
      }
    }
    restore()

    // Global session-expired event (fired by api/client.js on 401)
    const onExpired = () => {
      setUser(null)
      clearAccessToken()
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const register = useCallback(async (name, email, phone, password) => {
    const res = await authApi.register({ name, email, phone, password })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { }
    clearAccessToken()
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  const forgotPassword = useCallback(async (email) => {
    await authApi.forgotPassword(email)
  }, [])

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated, isAdmin,
      login, register, logout, updateUser,forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
