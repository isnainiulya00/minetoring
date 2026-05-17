import api from '../api/axios'

export const userService = {
  getAll: () => api.get('/api/user/').then((r) => r.data),
  getById: (id) => api.get(`/api/user/${id}/`).then((r) => r.data),
  create: (payload) =>
    api
      .post('/api/user/', {
        username: payload.username,
        password: payload.password,
        email: payload.email || '',
        first_name: payload.first_name || '',
        last_name: payload.last_name || '',
        role: payload.role,
        is_active: payload.is_active !== false,
      })
      .then((r) => r.data),
  update: (id, payload) => api.patch(`/api/user/${id}/`, payload).then((r) => r.data),
  delete: (id) => api.delete(`/api/user/${id}/`),
}
