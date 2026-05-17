import api from '../api/axios'

export const resumeService = {
  getAll: () => api.get('/api/resume/').then((r) => r.data),
  create: (formData) =>
    api.post('/api/resume/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  update: (id, formData) =>
    api.patch(`/api/resume/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  delete: (id) => api.delete(`/api/resume/${id}/`),
}
