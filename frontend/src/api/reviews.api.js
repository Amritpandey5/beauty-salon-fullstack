import api from './client'

export const reviewsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/reviews${qs ? `?${qs}` : ''}`)
  },

  getSummary: () =>
    api.get('/reviews/summary'),

  create: (data) =>
    api.post('/reviews', data),

  approve: (id, approved = true) =>
    api.patch(`/reviews/${id}/approve`, { approved }),

  remove: (id) =>
    api.delete(`/reviews/${id}`),
}
