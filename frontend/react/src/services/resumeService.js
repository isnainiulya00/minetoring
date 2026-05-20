import api, { multipartConfig } from '../api/axios'

export const resumeService = {
  getAll: () => api.get('/api/resume/').then((r) => r.data),
  create: (formData) => api.post('/api/resume/', formData, multipartConfig(formData)).then((r) => r.data),
  update: (id, formData) =>
    api.patch(`/api/resume/${id}/`, formData, multipartConfig(formData)).then((r) => r.data),
  grade: (id, payload) => api.patch(`/api/resume/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/resume/${id}/`),
}
