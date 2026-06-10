import api from './client'

export const authApi = {
  register: (data) =>
    api.post('/auth/register', data),

  login: (data) =>
    api.post('/auth/login', data),

  verifyEmail: (id,token) =>
    api.get(`/auth/verify-email?id=${id}&token=${token}`),

  resendVerification: (id) =>
    api.post('/auth/resend-verification', { id }),   

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get('/auth/me'),

  updateMe: (data) =>
    api.patch('/auth/me', data),

  changePassword: (data) =>
    api.patch('/auth/change-password', data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),
}
