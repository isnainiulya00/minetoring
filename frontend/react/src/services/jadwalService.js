import api from '../api/axios'

export const jadwalService = {
  getAll: () => api.get('/api/jadwal/').then((r) => r.data),
  getById: (id) => api.get(`/api/jadwal/${id}/`).then((r) => r.data),
  create: (payload) => api.post('/api/jadwal/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/jadwal/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/jadwal/${id}/`),
}
