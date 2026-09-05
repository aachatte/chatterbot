import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Vercel routing', () => {
  it('proxies API requests before the single-page app fallback', () => {
    const config = JSON.parse(
      readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')
    )

    expect(config.rewrites[0]).toEqual({
      source: '/api/:path*',
      destination: 'https://chatterbot-1855.onrender.com/api/:path*',
    })
    expect(config.rewrites.at(-1)).toEqual({
      source: '/(.*)',
      destination: '/index.html',
    })
  })
})
