import { describe, expect, it } from 'vitest'
import router from '@/router'

describe('router', () => {
  it('registers the home and settings routes', () => {
    expect(router.getRoutes()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'home', path: '/' }),
        expect.objectContaining({ name: 'settings', path: '/settings' }),
      ]),
    )
  })
})
