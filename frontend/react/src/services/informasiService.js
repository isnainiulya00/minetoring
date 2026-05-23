import api from '../api/axios' 

export const informasiService = {
  getAll: async () => {
    const response = await api.get('/api/informasi/')
    return response.data // 👈 KATA AJAIBNYA DI SINI
  },

  getById: async (id) => {
    const response = await api.get(`/api/informasi/${id}/`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/informasi/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.patch(`/api/informasi/${id}/`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/informasi/${id}/`)
    return response.data
  }
}