import api from './client'

export const uploadApi = {
  avatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.patch('/upload/avatar', form)
  },
}
