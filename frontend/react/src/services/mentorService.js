import api from '../api/axios'

export const mentorService = {
  getAll: () => api.get('/api/mentors/').then((r) => r.data),
  getById: (id) => api.get(`/api/mentors/${id}/`).then((r) => r.data),
  create: (data) => api.post('/api/mentors/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/api/mentors/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/api/mentors/${id}/`),
}
