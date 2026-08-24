const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('cb_token')
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body && typeof options.body === 'object'
      ? JSON.stringify(options.body)
      : options.body,
  }).catch((error) => {
    throw new ApiError(error.message || 'Network error', 0, {})
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed', response.status, data)
  }

  return data
}

export const api = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: { email, password },
  }),
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: data,
  }),
  getMe: () => request('/auth/me'),
  updateMe: (data) => request('/auth/me', {
    method: 'PUT',
    body: data,
  }),
  changePassword: (data) => request('/auth/change-password', {
    method: 'POST',
    body: data,
  }),
  getOverview: () => request('/dashboard/overview'),
  getTeens: () => request('/dashboard/teens'),
  createTeen: (data) => request('/dashboard/teens', {
    method: 'POST',
    body: data,
  }),
  getTeen: (id) => request(`/dashboard/teens/${id}`),
  updateTeen: (id, data) => request(`/dashboard/teens/${id}`, {
    method: 'PUT',
    body: data,
  }),
  getEnrollment: (id) => request(`/dashboard/teens/${id}/enrollment`),
  confirmGuardianConsent: (id) => request(`/dashboard/teens/${id}/consent`, {
    method: 'POST',
    body: { guardian_confirmation: true },
  }),
  requestPhoneVerification: (id) => request(`/dashboard/teens/${id}/phone-verification/request`, {
    method: 'POST',
  }),
  confirmPhoneVerification: (id, token) => request(`/dashboard/teens/${id}/phone-verification/confirm`, {
    method: 'POST',
    body: { token },
  }),
  updateGuardianPreferences: (data) => request('/dashboard/preferences', {
    method: 'PUT',
    body: data,
  }),
  updateTeenPreferences: (id, data) => request(`/dashboard/teens/${id}/preferences`, {
    method: 'PUT',
    body: data,
  }),
  deleteTeen: (id) => request(`/dashboard/teens/${id}`, {
    method: 'DELETE',
  }),
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/dashboard/alerts${query ? `?${query}` : ''}`)
  },
  getAlert: (id) => request(`/dashboard/alerts/${id}`),
  resolveAlert: (id, notes = '') => request(`/dashboard/alerts/${id}/resolve`, {
    method: 'POST',
    body: { notes },
  }),
  acknowledgeAlert: (id, notes = '') => request(`/dashboard/alerts/${id}/acknowledge`, {
    method: 'POST',
    body: { notes },
  }),
  sendNudge: (teenId, message) => request(`/sms/nudge/${teenId}`, {
    method: 'POST',
    body: { message },
  }),
  sendDashboardChat: (message) => request('/dashboard-chat/', {
    method: 'POST',
    body: { message },
  }),
  createSupportRequest: (data) => request('/support/contact', {
    method: 'POST',
    body: data,
  }),
}

export { ApiError }
