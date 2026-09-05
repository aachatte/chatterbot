import { expect, test } from '@playwright/test'

const guardian = {
  id: 1,
  first_name: 'Alex',
  last_name: 'Rivera',
  email: 'guardian@example.com',
}

test('guardian completes the controlled pilot onboarding journey', async ({
  page,
}) => {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    let payload = {}

    if (path === '/api/auth/refresh') {
      payload = { access_token: 'pilot-access-token', user: guardian }
    } else if (path === '/api/auth/me') {
      payload = { user: guardian }
    } else if (path === '/api/dashboard/teens' && request.method() === 'POST') {
      payload = { teen: { id: 7, first_name: 'Maya' } }
    } else if (path.endsWith('/consent')) {
      payload = {
        enrollment: {
          consent_verified: true,
          phone_verification_status: 'unverified',
        },
      }
    } else if (path.endsWith('/begin-verification')) {
      payload = {
        delivery_method: 'sms',
        enrollment: {
          consent_verified: true,
          phone_verification_status: 'pending',
        },
      }
    } else if (path.endsWith('/verify-phone')) {
      payload = {
        enrollment: {
          consent_verified: true,
          phone_verification_status: 'verified',
        },
      }
    } else if (path === '/api/care-circle/members') {
      payload = {
        member: { id: 9, name: 'Jordan Lee', status: 'pending' },
        invite_token: 'pilot-invite-token',
      }
    } else if (path === '/api/dashboard/preferences') {
      payload = { preferences: { crisis_alerts_enabled: true } }
    } else if (path === '/api/dashboard/overview') {
      payload = {
        parent: guardian,
        summary: { active_alerts: 0, total_teens: 1 },
        teens: [],
        recent_alerts: [],
      }
    } else if (path === '/api/dashboard/teens') {
      payload = { teens: [] }
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    })
  })

  await page.goto('/dashboard/onboarding')
  await expect(
    page.getByRole('heading', { name: 'Add your teen' })
  ).toBeVisible()
  await page.getByLabel("Teen's name").fill('Maya')
  await page.getByLabel("Teen's cell phone").fill('+15555550102')
  await page.getByRole('button', { name: /Continue/ }).click()

  await page.getByRole('button', { name: 'Confirm guardian consent' }).click()
  await page.getByRole('button', { name: 'Send verification text' }).click()
  await page
    .getByLabel('Verification code or token')
    .fill('verification-token-value')
  await page.getByRole('button', { name: /Verify/ }).click()

  await expect(
    page.getByRole('heading', { name: 'Set preferences and collaboration' })
  ).toBeVisible()
  await page.getByPlaceholder('Name').fill('Jordan Lee')
  await page.getByPlaceholder('Email').fill('jordan@example.com')
  await page.getByRole('button', { name: 'Create invite' }).click()
  await expect(page.getByText('Jordan Lee · invitation pending')).toBeVisible()

  await page.getByRole('button', { name: /Finish setup/ }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})
