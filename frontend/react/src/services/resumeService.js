import api, { multipartConfig } from '../api/axios'

export const resumeService = {
  getAll: () => api.get('/api/resumes/').then((r) => r.data),
  create: (formData) => api.post('/api/resumes/', formData, multipartConfig(formData)).then((r) => r.data),
  update: (id, formData) =>
    api.patch(`/api/resumes/${id}/`, formData, multipartConfig(formData)).then((r) => r.data),
  grade: (id, payload) => api.patch(`/api/resumes/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/resumes/${id}/`),
}
