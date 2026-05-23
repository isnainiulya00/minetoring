import api, { multipartConfig } from '../api/axios'

export const materiService = {
  getAll: () => api.get('/api/materis/').then((r) => r.data),
  getById: (id) => api.get(`/api/materis/${id}/`).then((r) => r.data),
  create: (data) => api.post('/api/materis/', data, multipartConfig(data)).then((r) => r.data),
  update: (id, data) => api.patch(`/api/materis/${id}/`, data, multipartConfig(data)).then((r) => r.data),
  delete: (id) => api.delete(`/api/materis/${id}/`),
}
