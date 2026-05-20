import api from '../api/axios'

export const halaqahService = {
  getAll: () => api.get('/api/halaqah/').then((r) => r.data),
  getById: (id) => api.get(`/api/halaqah/${id}/`).then((r) => r.data),
  create: (data) => api.post('/api/halaqah/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/api/halaqah/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/api/halaqah/${id}/`),
  initSemester: (id, semester) =>
    api.post(`/api/halaqah/${id}/init-semester/`, { semester }).then((r) => r.data),
}
