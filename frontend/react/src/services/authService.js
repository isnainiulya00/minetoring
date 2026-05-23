import axios from 'axios'
import api, { multipartConfig } from '../api/axios'
import { API_BASE_URL } from '../utils/constants'

export const authService = {
  login: async (username, password) => {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/login/`,
      { username, password }
    )

    return data
  },

  refresh: async (refresh) => {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/token/refresh/`,
      { refresh }
    )

    return data
  },

  getMe: async () => {
    const { data } = await api.get('/api/users/me/')
    return data
  },

  fetchUser: async (userId) => {
    const { data } = await api.get(`/api/users/${userId}/`)
    return data
  },

  updateUser: async (userId,payload) => {
    const { data } = await api.patch(
      `/api/users/${userId}/`,
      payload,
      multipartConfig(payload)
    )

    return data
  },

  updateMe: async (payload) => {
    const { data } = await api.patch(
      '/api/users/me/',
      payload,
      multipartConfig(payload)
    )

    return data
  }
}