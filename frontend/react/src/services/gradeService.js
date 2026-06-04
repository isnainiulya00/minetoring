import api from '../api/axios'

export const gradeService = {
  getAll: () => api.get('/api/nilai-ujian/').then((r) => r.data),
  create: (payload) => api.post('/api/nilai-ujian/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/nilai-ujian/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/nilai-ujian/${id}/`),
}
