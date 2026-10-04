import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('supports clsx conditional and array syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
    expect(cn(['a', ['b', 'c']])).toBe('a b c')
  })

  it('ignores falsy inputs', () => {
    expect(cn(undefined, null, false, '', 0, 'kept')).toBe('kept')
  })

  it('lets tailwind-merge resolve conflicting utilities (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('keeps utilities that do not conflict', () => {
    expect(cn('px-2 py-1', 'font-bold')).toBe('px-2 py-1 font-bold')
  })

  it('returns an empty string when nothing is passed', () => {
    expect(cn()).toBe('')
  })
})
