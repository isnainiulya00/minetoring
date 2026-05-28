import api from '../api/axios'

export const analyticsService = {
  overview: () => api.get('/api/analytics/overview/').then((r) => r.data),
  rekapHalaqah: (semester) =>
    api
      .get('/api/halaqah/', { params: semester ? { semester } : {} })
      .then((r) => r.data),
}
