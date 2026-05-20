import api from '../api/axios'

export const mentorService = {
  getAll: () => api.get('/api/mentor/').then((r) => r.data),
  getById: (id) => api.get(`/api/mentor/${id}/`).then((r) => r.data),
  create: (data) => api.post('/api/mentor/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/api/mentor/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/api/mentor/${id}/`),
}
