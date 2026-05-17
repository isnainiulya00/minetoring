import api from '../api/axios'

export const menteeService = {
  getAll: () => api.get('/api/mentee/').then((r) => r.data),
  getById: (id) => api.get(`/api/mentee/${id}/`).then((r) => r.data),
  create: (payload) => api.post('/api/mentee/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/mentee/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/mentee/${id}/`),
}
