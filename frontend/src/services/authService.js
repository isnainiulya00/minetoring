import api from './api'

/**
 * Login ke backend DRF (sesuaikan path dengan endpoint proyek Anda).
 * Jika gagal, caller bisa fallback ke sesi demo lokal.
 */
export async function loginRequest({ email, password }) {
  const { data } = await api.post('/auth/login/', { email, password })
  return data
}

export async function fetchProfile() {
  const { data } = await api.get('/auth/me/')
  return data
}
