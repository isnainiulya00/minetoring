import api from '../api/axios'

export const sertifikatService = {
  getAll: () => api.get('/api/sertifikat/').then((r) => r.data),
  getById: (id) => api.get(`/api/sertifikat/${id}/`).then((r) => r.data),
  create: (payload) => api.post('/api/sertifikat/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/sertifikat/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/sertifikat/${id}/`),
}
