import client from './client'

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (payload) => client.post('/auth/register', payload),
}

export const metaApi = {
  departments: () => client.get('/v1/meta/departments'),
  offices: () => client.get('/v1/meta/offices'),
}

export const acrApi = {
  list: () => client.get('/v1/acr'),
  detail: (statusId) => client.get(`/v1/acr/${statusId}`),
  eligibility: () => client.get('/v1/acr/eligibility'),
  submit: (payload) => client.post('/v1/acr/submit', payload),
  review: (statusId, payload) => client.put(`/v1/acr/${statusId}/review`, payload),
}

export const employeeApi = {
  list: () => client.get('/v1/employees'),
  get: (id) => client.get(`/v1/employees/${id}`),
  add: (payload) => client.post('/v1/employees', payload),
  update: (id, payload) => client.put(`/v1/employees/${id}`, payload),
  setActive: (id, active) => client.patch(`/v1/employees/${id}/active?active=${active}`),
  remove: (id) => client.delete(`/v1/employees/${id}`),
}

export const notificationApi = {
  list: () => client.get('/v1/notifications'),
  unreadCount: () => client.get('/v1/notifications/unread-count'),
  markRead: (id) => client.patch(`/v1/notifications/${id}/read`),
  markAllRead: () => client.patch('/v1/notifications/read-all'),
  send: (payload) => client.post('/v1/notifications/send', payload),
  sendReminders: (employeeIds) => client.post('/v1/notifications/reminders', { employeeIds }),
  autoReminders: () => client.post('/v1/notifications/reminders/auto'),
  pending: () => client.get('/v1/notifications/pending'),
}

export const meApi = {
  profile: () => client.get('/v1/me'),
  update: (payload) => client.put('/v1/me', payload),
}
