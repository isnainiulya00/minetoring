import api from '../api/axios'

export const userService = {
  getAll: async () => {
    const { data } = await api.get('/api/users/')
    return data
  },

  getById: async (id) => {
    const { data } = await api.get(`/api/users/${id}/`)
    return data
  },

  createCustom: async (payload) => {
    const { data } = await api.post(
      '/api/kmf/tambah-user/',
      payload
    )

    return data
  },

  update: async (id, payload) => {
    const { data } = await api.patch(
      `/api/users/${id}/`,
      payload
    )

    return data
  },

  delete: async (id) => {
    const { data } = await api.delete(
      `/api/users/${id}/`
    )

    return data
  },
}