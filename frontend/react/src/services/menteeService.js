import api from '../api/axios'

export const menteeService = {
  // Tambahkan 's' menjadi /api/mentees/
  getAll: () => api.get('/api/mentees/').then((r) => r.data),
  
  // Tambahkan 's' menjadi /api/mentees/${id}/
  getById: (id) => api.get(`/api/mentees/${id}/`).then((r) => r.data),
  
  create: (payload) => api.post('/api/mentees/', payload).then((r) => r.data),
  
  update: (id, payload) => api.patch(`/api/mentees/${id}/`, payload).then((r) => r.data),
  
  delete: (id) => api.delete(`/api/mentees/${id}/`),
}