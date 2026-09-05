import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('API routing', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('ignores cross-origin API configuration in production', async () => {
    const { resolveApiBase } = await import('./api.js')

    expect(
      resolveApiBase({
        isProduction: true,
        configuredUrl: 'https://example.invalid/api',
      })
    ).toBe('/api')
  })

  it('sends auth requests through the same-origin API path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api.js')
    await expect(api.login('guardian@example.com', 'incorrect')).rejects.toThrow(
      'Invalid credentials'
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
      })
    )
  })
})
