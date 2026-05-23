import api from './client'
import { getCache, setCache } from './cache'

export const specialistsApi = {
  getAll: async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  const cacheKey = `specialists`
  const cached = getCache(cacheKey)
  if(cached){
    return cached
  }

  const res = await api.get(`/specialists${qs ? `?${qs}` : ''}`)
  const data = res.data?.specialists || []
  setCache(cacheKey, data)
  return data
},

  getOne: async (id) => {
    const res = await api.get(`/specialists/${id}`)
    return res.data?.data || null
  },

  getAvailability: async (id, date) => {
    const res = await api.get(`/specialists/${id}/availability?date=${date}`)
    // console.log(res.data.availableSlots);

    return res.data?.availableSlots || []
  },

  create: (data) => api.post('/specialists', data),
  update: (id, data) => api.patch(`/specialists/${id}`, data),
  remove: (id) => api.delete(`/specialists/${id}`),
}