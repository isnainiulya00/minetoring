import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext'

const STORAGE_USER = 'mt_user'
const STORAGE_TOKEN = 'mt_token'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const setSession = useCallback((nextUser, token) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORAGE_USER)
    }
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_TOKEN)
    }
  }, [])

  const logout = useCallback(() => {
    setSession(null, null)
  }, [setSession])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      setSession,
      logout,
    }),
    [user, setSession, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
