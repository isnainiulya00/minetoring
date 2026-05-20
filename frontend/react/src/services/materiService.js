import api, { multipartConfig } from '../api/axios'

export const materiService = {
  getAll: () => api.get('/api/materi/').then((r) => r.data),
  getById: (id) => api.get(`/api/materi/${id}/`).then((r) => r.data),
  create: (data) => api.post('/api/materi/', data, multipartConfig(data)).then((r) => r.data),
  update: (id, data) => api.patch(`/api/materi/${id}/`, data, multipartConfig(data)).then((r) => r.data),
  delete: (id) => api.delete(`/api/materi/${id}/`),
}
