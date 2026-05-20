import { API_BASE_URL } from './constants'

/** Resolve relative media paths from Django to full download URLs */
export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE_URL.replace(/\/$/, '')
  const rel = path.startsWith('/') ? path : `/${path}`
  return `${base}${rel}`
}
