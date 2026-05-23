import api from './client'

export const contactApi = {
  submit: (data) =>
    api.post('/contact', data),
}

export const newsletterApi = {
  subscribe: (email) =>
    api.post('/newsletter/subscribe', { email }),
}
