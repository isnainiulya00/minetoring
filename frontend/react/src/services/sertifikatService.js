import api from '../api/axios'

export const sertifikatService = {
  getAll: () => api.get('/api/sertifikats/').then((r) => r.data),
  getById: (id) => api.get(`/api/sertifikats/${id}/`).then((r) => r.data),
  create: (payload) => api.post('/api/sertifikats/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/sertifikats/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/sertifikats/${id}/`),
}
