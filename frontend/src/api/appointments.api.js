import api from './client'

export const appointmentsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/appointments${qs ? `?${qs}` : ''}`)
  },

  getOne: (id) =>
    api.get(`/appointments/${id}`),

  getStats: () =>
    api.get('/appointments/stats'),

  create: (data) =>
    api.post('/appointments', data),

  updateStatus: (id, status, cancellationReason) =>
    api.patch(`/appointments/${id}/status`, { status, cancellationReason }),

  remove: (id) =>
    api.delete(`/appointments/${id}`),
}
