import api from '../api/axios'

export const mutabaahService = {
  getAll: () => api.get('/api/mutabaahs/').then((r) => r.data),
  create: (payload) => api.post('/api/mutabaahs/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/mutabaahs/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/mutabaahs/${id}/`),
}
