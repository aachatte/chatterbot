/* API service layer for Chatterbot backend */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('cb_token')
  const url = `${API_BASE}${path}`

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const res = await fetch(url, config)
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new ApiError(data.error || 'Request failed', res.status, data)
    }

    return data
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(err.message || 'Network error', 0, {})
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: { email, password }
  }),

  register: (data) => request('/auth/register', {
    method: 'POST',
    body: data
  }),

  getMe: () => request('/auth/me'),

  updateMe: (data) => request('/auth/me', {
    method: 'PUT',
    body: data
  }),

  changePassword: (data) => request('/auth/change-password', {
    method: 'POST',
    body: data
  }),

  // Dashboard
  getOverview: () => request('/dashboard/overview'),

  // Teens
  getTeens: () => request('/dashboard/teens'),
  createTeen: (data) => request('/dashboard/teens', {
    method: 'POST',
    body: data
  }),
  getTeen: (id) => request(`/dashboard/teens/${id}`),
  updateTeen: (id, data) => request(`/dashboard/teens/${id}`, {
    method: 'PUT',
    body: data
  }),
  deleteTeen: (id) => request(`/dashboard/teens/${id}`, {
    method: 'DELETE'
  }),

  // Alerts
  getAlerts: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/dashboard/alerts${qs ? `?${qs}` : ''}`)
  },
  getAlert: (id) => request(`/dashboard/alerts/${id}`),
  resolveAlert: (id, notes = '') => request(`/dashboard/alerts/${id}/resolve`, {
    method: 'POST',
    body: { notes }
  }),

  // SMS
  sendNudge: (teenId, message) => request(`/sms/nudge/${teenId}`, {
    method: 'POST',
    body: { message }
  }),
}

export { ApiError }
