import api from '../api/axios'

export const halaqahService = {
  getAll: () => api.get('/api/halaqah/').then((r) => r.data),
  getById: (id) => api.get(`/api/halaqah/${id}/`).then((r) => r.data),
  create: (payload) => api.post('/api/halaqah/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/halaqah/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/halaqah/${id}/`),
}
