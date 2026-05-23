import api from './client'
import { getCache, setCache } from './cache'


export const servicesApi = {
  getAll: async () => {
  const cacheKey = `services`
  const cached = getCache(cacheKey)
  if(cached){
    return cached
  }

  const res = await api.get('/services')

  const data = res.data.services || []
  setCache(cacheKey, data)
  // console.log(res.data.services);
  return data
},

  getOne: (id) =>
    api.get(`/services/${id}`),

  create: (data) =>
    api.post('/services', data),

  update: (id, data) =>
    api.patch(`/services/${id}`, data),

  remove: (id) =>
    api.delete(`/services/${id}`),
}
