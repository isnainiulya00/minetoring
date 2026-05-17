import api from '../api/axios'

export const presensiService = {
  getAll: () => api.get('/api/presensi/').then((r) => r.data),
  create: (payload) => api.post('/api/presensi/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/presensi/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/presensi/${id}/`),
}
