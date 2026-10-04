import { afterEach, describe, expect, it } from 'vitest'
import { i18n } from '@/i18n/config'
import en from '@/i18n/en.json'
import zh from '@/i18n/zh.json'

/** Collect every leaf key path so the two locales can be compared. */
function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix]
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

afterEach(() => {
  i18n.global.locale.value = 'en'
})

describe('i18n config', () => {
  it('defaults to English', () => {
    expect(i18n.global.locale.value).toBe('en')
    expect(i18n.global.t('common.title')).toBe('Vue Project Template')
  })

  it('exposes every shipped locale', () => {
    expect([...i18n.global.availableLocales].sort()).toEqual(['en', 'zh'])
  })

  it('switches the active locale', () => {
    i18n.global.locale.value = 'zh'
    expect(i18n.global.t('common.title')).toBe('Vue 项目模板')
  })

  it('keeps en and zh keys in sync', () => {
    expect(flattenKeys(zh).sort()).toEqual(flattenKeys(en).sort())
  })
})
