const API_BASE = import.meta.env.VITE_API_URL || '/api'
let accessToken = null
let staffAccessToken =
  typeof window !== 'undefined'
    ? window.sessionStorage.getItem('chatterbot_staff_token')
    : null

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    body:
      options.body && typeof options.body === 'object'
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

async function staffRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(staffAccessToken
        ? { Authorization: `Bearer ${staffAccessToken}` }
        : {}),
      ...options.headers,
    },
    body:
      options.body && typeof options.body === 'object'
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
  setAccessToken: (token) => {
    accessToken = token || null
  },
  getAccessToken: () => accessToken,
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: data,
    }),
  refreshSession: () => request('/auth/refresh', { method: 'POST' }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateMe: (data) =>
    request('/auth/me', {
      method: 'PUT',
      body: data,
    }),
  changePassword: (data) =>
    request('/auth/change-password', {
      method: 'POST',
      body: data,
    }),
  getOverview: () => request('/dashboard/overview'),
  getTeens: () => request('/dashboard/teens'),
  createTeen: (data) =>
    request('/dashboard/teens', {
      method: 'POST',
      body: data,
    }),
  getTeen: (id) => request(`/dashboard/teens/${id}`),
  updateTeen: (id, data) =>
    request(`/dashboard/teens/${id}`, {
      method: 'PUT',
      body: data,
    }),
  getEnrollment: (id) => request(`/dashboard/teens/${id}/enrollment`),
  confirmGuardianConsent: (id) =>
    request(`/dashboard/teens/${id}/consent`, {
      method: 'POST',
      body: { guardian_confirmation: true },
    }),
  requestPhoneVerification: (id) =>
    request(`/dashboard/teens/${id}/phone-verification/request`, {
      method: 'POST',
    }),
  confirmPhoneVerification: (id, token) =>
    request(`/dashboard/teens/${id}/phone-verification/confirm`, {
      method: 'POST',
      body: { token },
    }),
  updateGuardianPreferences: (data) =>
    request('/dashboard/preferences', {
      method: 'PUT',
      body: data,
    }),
  getGuardianNotifications: () => request('/dashboard/notifications'),
  markGuardianNotificationRead: (id) =>
    request(`/dashboard/notifications/${id}/read`, { method: 'PATCH' }),
  updateTeenPreferences: (id, data) =>
    request(`/dashboard/teens/${id}/preferences`, {
      method: 'PUT',
      body: data,
    }),
  deleteTeen: (id, confirmation) =>
    request(`/dashboard/teens/${id}`, {
      method: 'DELETE',
      body: { confirmation },
    }),
  getPrivacyOverview: () => request('/privacy/overview'),
  exportGuardianData: () => request('/privacy/export', { method: 'POST' }),
  cancelDeletionRequest: (id) =>
    request(`/privacy/deletion-requests/${id}`, { method: 'DELETE' }),
  withdrawTeenConsent: (id) =>
    request(`/privacy/teens/${id}/consent`, { method: 'DELETE' }),
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/dashboard/alerts${query ? `?${query}` : ''}`)
  },
  getAlert: (id) => request(`/dashboard/alerts/${id}`),
  resolveAlert: (id, notes = '') =>
    request(`/dashboard/alerts/${id}/resolve`, {
      method: 'POST',
      body: { notes },
    }),
  acknowledgeAlert: (id, notes = '') =>
    request(`/dashboard/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: { notes },
    }),
  updateAlertWorkflow: (id, data) =>
    request(`/dashboard/alerts/${id}/workflow`, {
      method: 'PATCH',
      body: data,
    }),
  sendNudge: (teenId, message) =>
    request(`/sms/nudge/${teenId}`, {
      method: 'POST',
      body: { message },
    }),
  sendDashboardChat: (message) =>
    request('/dashboard-chat/', {
      method: 'POST',
      body: { message },
    }),
  createSupportRequest: (data) =>
    request('/support/contact', {
      method: 'POST',
      body: data,
    }),

  // Mood tracking
  getMoodHistory: (teenId) => request(`/teens/${teenId}/mood`),
  logMood: (teenId, score, note = '') =>
    request(`/teens/${teenId}/mood`, {
      method: 'POST',
      body: { score, note },
    }),

  // Weekly digest
  sendDigest: () => request('/digest/send', { method: 'POST' }),

  // Check-in schedule
  getCheckinSchedule: (teenId) => request(`/teens/${teenId}/checkin-schedule`),
  upsertCheckinSchedule: (teenId, data) =>
    request(`/teens/${teenId}/checkin-schedule`, {
      method: 'POST',
      body: data,
    }),

  // School counselors
  getCounselors: () => request('/counselors'),
  addCounselor: (data) =>
    request('/counselors', { method: 'POST', body: data }),
  deleteCounselor: (id) => request(`/counselors/${id}`, { method: 'DELETE' }),

  // Care Circle
  getCareCircle: (teenId) => {
    const query = teenId ? `?teen_id=${encodeURIComponent(teenId)}` : ''
    return request(`/care-circle${query}`)
  },
  createCareCircleMember: (data) =>
    request('/care-circle/members', {
      method: 'POST',
      body: data,
    }),
  updateCareCircleMember: (id, data) =>
    request(`/care-circle/members/${id}`, {
      method: 'PATCH',
      body: data,
    }),
  deleteCareCircleMember: (id) =>
    request(`/care-circle/members/${id}`, {
      method: 'DELETE',
    }),
  refreshCareCircleInvitation: (id) =>
    request(`/care-circle/members/${id}/invitation`, {
      method: 'POST',
    }),
  getCareCircleInvitation: (token) =>
    request(`/care-circle/invitations/${encodeURIComponent(token)}`),
  acceptCareCircleInvitation: (token) =>
    request(`/care-circle/invitations/${encodeURIComponent(token)}/accept`, {
      method: 'POST',
    }),
  getSafetyPlan: (teenId) => request(`/safety-plans/${teenId}`),
  saveSafetyPlan: (teenId, plan, isActive = true) =>
    request(`/safety-plans/${teenId}`, {
      method: 'PUT',
      body: { plan, is_active: isActive },
    }),

  // Referrals
  generateReferral: () => request('/referrals/generate', { method: 'POST' }),
  getReferrals: () => request('/referrals'),
  redeemReferral: (code, email) =>
    request('/referrals/redeem', {
      method: 'POST',
      body: { code, email },
    }),

  // Onboarding
  addTeen: (name, phone) =>
    request('/dashboard/teens', {
      method: 'POST',
      body: { first_name: name, phone },
    }),
  beginPhoneVerification: (teenId) =>
    request(`/dashboard/teens/${teenId}/begin-verification`, {
      method: 'POST',
    }),
  verifyPhone: (teenId, token) =>
    request(`/dashboard/teens/${teenId}/verify-phone`, {
      method: 'POST',
      body: { token },
    }),

  // Conversation summaries (uses mood entries as proxy)
  getConversationSummaries: (teenId) => request(`/teens/${teenId}/mood`),
}

export const staffApi = {
  hasSession: () => Boolean(staffAccessToken),
  setAccessToken: (token) => {
    staffAccessToken = token || null
    if (typeof window !== 'undefined') {
      if (staffAccessToken) {
        window.sessionStorage.setItem(
          'chatterbot_staff_token',
          staffAccessToken
        )
      } else {
        window.sessionStorage.removeItem('chatterbot_staff_token')
      }
    }
  },
  login: async (email, password) => {
    const data = await staffRequest('/admin/session', {
      method: 'POST',
      body: { email, password },
    })
    staffApi.setAccessToken(data.access_token)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        'chatterbot_staff_profile',
        JSON.stringify(data.staff)
      )
    }
    return data
  },
  profile: () => {
    if (typeof window === 'undefined') return null
    try {
      return JSON.parse(
        window.sessionStorage.getItem('chatterbot_staff_profile') || 'null'
      )
    } catch {
      return null
    }
  },
  logout: async () => {
    try {
      if (staffAccessToken) {
        await staffRequest('/admin/session', { method: 'DELETE' })
      }
    } finally {
      staffApi.setAccessToken(null)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('chatterbot_staff_profile')
      }
    }
  },
  getMetrics: (days = 30) => staffRequest(`/admin/pilot/metrics?days=${days}`),
  getOperations: () => staffRequest('/admin/operations?status=open'),
  getPilot: () => staffRequest('/admin/pilot'),
  getAuditLog: () => staffRequest('/admin/audit-log'),
  resolveOperation: (id, note) =>
    staffRequest(`/admin/operations/${id}/resolve`, {
      method: 'PATCH',
      body: { note },
    }),
  updatePilot: (enabled, reason) =>
    staffRequest('/admin/pilot', {
      method: 'PATCH',
      body: { enabled, reason },
    }),
}

export { ApiError }
