import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '../utils/apiConfig'

const AuthContext = createContext(null)

const TOKEN_KEY = 'mg_token'
const USER_KEY  = 'mg_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [isLoading, setIsLoading] = useState(false)

  const clearAuth = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  // On mount, validate stored token against /api/auth/me
  useEffect(() => {
    if (!token) return

    let isMounted = true

    const validateToken = async () => {
      try {
        const res = await fetch(getApiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (isMounted) {
          if (data.success) {
            setUser(data.user)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
          } else {
            clearAuth()
          }
        }
      } catch {
        if (isMounted) clearAuth()
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    validateToken()

    return () => {
      isMounted = false
    }
  }, [token, clearAuth])

  /**
   * Call after successful login or signup.
   * @param {string} jwt
   * @param {object} userData
   */
  const login = useCallback((jwt, userData) => {
    setToken(jwt)
    setUser(userData)
    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }, [])

  /**
   * Clear auth state and token — triggers redirect via ProtectedRoute.
   */
  const logout = useCallback(async () => {
    if (token && !token.includes('guest')) {
      try {
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch {
        // Best-effort logout — clear locally regardless
      }
    }
    clearAuth()
  }, [token, clearAuth])

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
