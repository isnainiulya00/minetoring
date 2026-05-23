import api from '../api/axios'


export const presensiService = {
  getAll: async () => {
    const response = await api.get('/api/presensi/')
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/presensi/${id}/`)
    return response.data
  },

  create: async (data) => {
    // Jalur POST untuk data baru
    const response = await api.post('/api/presensi/', data)
    return response.data
  },

  update: async (id, data) => {
    // Jalur PATCH untuk edit data lama
    const response = await api.patch(`/api/presensi/${id}/`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/presensi/${id}/`)
    return response.data
  }
}