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

  // Mood tracking
  getMoodHistory: (teenId) => request(`/teens/${teenId}/mood`),
  logMood: (teenId, score, note = '') => request(`/teens/${teenId}/mood`, {
    method: 'POST',
    body: { score, note },
  }),

  // Weekly digest
  sendDigest: () => request('/digest/send', { method: 'POST' }),

  // Check-in schedule
  getCheckinSchedule: (teenId) => request(`/teens/${teenId}/checkin-schedule`),
  upsertCheckinSchedule: (teenId, data) => request(`/teens/${teenId}/checkin-schedule`, {
    method: 'POST',
    body: data,
  }),

  // School counselors
  getCounselors: () => request('/counselors'),
  addCounselor: (data) => request('/counselors', { method: 'POST', body: data }),
  deleteCounselor: (id) => request(`/counselors/${id}`, { method: 'DELETE' }),

  // Care Circle
  getCareCircle: (teenId) => {
    const query = teenId ? `?teen_id=${encodeURIComponent(teenId)}` : ''
    return request(`/care-circle${query}`)
  },
  createCareCircleMember: (data) => request('/care-circle/members', {
    method: 'POST',
    body: data,
  }),
  updateCareCircleMember: (id, data) => request(`/care-circle/members/${id}`, {
    method: 'PATCH',
    body: data,
  }),
  deleteCareCircleMember: (id) => request(`/care-circle/members/${id}`, {
    method: 'DELETE',
  }),
  refreshCareCircleInvitation: (id) => request(`/care-circle/members/${id}/invitation`, {
    method: 'POST',
  }),
  getCareCircleInvitation: (token) => request(`/care-circle/invitations/${encodeURIComponent(token)}`),
  acceptCareCircleInvitation: (token) => request(`/care-circle/invitations/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
  }),

  // Referrals
  generateReferral: () => request('/referrals/generate', { method: 'POST' }),
  getReferrals: () => request('/referrals'),
  redeemReferral: (code, email) => request('/referrals/redeem', {
    method: 'POST',
    body: { code, email },
  }),

  // Onboarding
  addTeen: (name, phone) => request('/dashboard/teens', {
    method: 'POST',
    body: { first_name: name, phone },
  }),
  beginPhoneVerification: (teenId) => request(`/dashboard/teens/${teenId}/begin-verification`, {
    method: 'POST',
  }),
  verifyPhone: (teenId, token) => request(`/dashboard/teens/${teenId}/verify-phone`, {
    method: 'POST',
    body: { token },
  }),

  // Conversation summaries (uses mood entries as proxy)
  getConversationSummaries: (teenId) => request(`/teens/${teenId}/mood`),
}

export { ApiError }
