import api from '../api/axios'

export const hafalanService = {
  getAll: () => api.get('/api/hafalan/').then((r) => r.data),
  create: (payload) => api.post('/api/hafalan/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/hafalan/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/hafalan/${id}/`),
}
