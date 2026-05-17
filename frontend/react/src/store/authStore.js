import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import api, { clearTokens, setTokens, getAccessToken, isTokenExpired } from '../api/axios'
import { STORAGE_KEYS } from '../utils/constants'
import { authService } from '../services/authService'

function getUserIdFromToken(token) {
  const decoded = jwtDecode(token)
  return decoded.user_id ?? decoded.id ?? decoded.sub
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true })
        try {
          const { access, refresh } = await authService.login(username, password)
          setTokens(access, refresh)

          const userId = getUserIdFromToken(access)
          const user = await authService.fetchUser(userId)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        clearTokens()
        set({ user: null, isAuthenticated: false })
      },

      loadUser: async () => {
        const token = getAccessToken()
        if (!token || isTokenExpired(token)) {
          get().logout()
          return false
        }

        try {
          const cached = localStorage.getItem(STORAGE_KEYS.USER)
          if (cached) {
            set({ user: JSON.parse(cached), isAuthenticated: true })
          }

          const userId = getUserIdFromToken(token)
          const user = await authService.fetchUser(userId)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
          set({ user, isAuthenticated: true })
          return true
        } catch {
          get().logout()
          return false
        }
      },

      updateUser: (user) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        set({ user })
      },
    }),
    {
      name: 'mine-toring-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
