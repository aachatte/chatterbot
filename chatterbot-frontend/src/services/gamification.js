const GAM_API = '/api/gamification'

import { api } from './api.js'

export async function fetchMyGamification() {
  const token = api.getAccessToken()
  const res = await fetch(`${GAM_API}/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch gamification status')
  }
  return res.json()
}

export async function claimDailyLoginReward() {
  const token = api.getAccessToken()
  const res = await fetch(`${GAM_API}/award-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to claim reward')
  return data
}

export async function fetchBadges() {
  const json = await fetchMyGamification()
  return json.badges || []
}
