import api from '../api/axios'

export const mentorService = {
  getAll: () => api.get('/api/mentor/').then((r) => r.data),
  getById: (id) => api.get(`/api/mentor/${id}/`).then((r) => r.data),
}
