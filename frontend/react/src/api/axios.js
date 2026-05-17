import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS)
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.REFRESH)
}

export function setTokens(access, refresh) {
  localStorage.setItem(STORAGE_KEYS.ACCESS, access)
  if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH, refresh)
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS)
  localStorage.removeItem(STORAGE_KEYS.REFRESH)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export function isTokenExpired(token) {
  if (!token) return true
  try {
    const { exp } = jwtDecode(token)
    return Date.now() >= exp * 1000 - 30000
  } catch {
    return true
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 403) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (
      originalRequest.url?.includes('/api/token/') &&
      !originalRequest.url?.includes('/api/token/refresh/')
    ) {
      return Promise.reject(error)
    }
    if (originalRequest.url?.includes('/api/login/') || originalRequest.url?.includes('/api/token/refresh/')) {
      return Promise.reject(error)
    }

    const refresh = getRefreshToken()
    if (!refresh) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/token/refresh/`, { refresh })
      setTokens(data.access, data.refresh ?? refresh)
      processQueue(null, data.access)
      originalRequest.headers.Authorization = `Bearer ${data.access}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
