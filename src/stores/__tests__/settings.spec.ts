import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { LOCAL_STORAGE_KEY_PREFIX, useSettingsStore } from '@/stores/settings'

// The store calls useI18n() at setup time, which needs a component/app context.
// Mock it so the store can be exercised in isolation; the real i18n integration
// is covered by the view specs.
const i18n = vi.hoisted(() => ({
  locale: { value: 'en' },
  t: vi.fn((key: string) => `translated:${key}`),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: i18n.locale, t: i18n.t }),
}))

const LANGUAGE_KEY = `${LOCAL_STORAGE_KEY_PREFIX}language`
const COLOR_MODE_KEY = `${LOCAL_STORAGE_KEY_PREFIX}color-mode`

function createMatchMedia(prefersDark: boolean) {
  return (query: string): MediaQueryList =>
    ({
      matches: query.includes('prefers-color-scheme: dark') && prefersDark,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

function setBrowserLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'languages', {
    value: languages,
    configurable: true,
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  i18n.locale.value = 'en'
  i18n.t.mockClear()
  setBrowserLanguages(['en-US', 'en'])
  window.matchMedia = createMatchMedia(false)
})

afterEach(() => {
  window.matchMedia = createMatchMedia(false)
})

describe('settings store', () => {
  describe('language detection', () => {
    it('defaults to en for English browsers', () => {
      expect(useSettingsStore().language).toBe('en')
    })

    it('defaults to zh when the browser prefers Chinese', () => {
      setBrowserLanguages(['zh-CN', 'zh'])
      expect(useSettingsStore().language).toBe('zh')
    })

    it('treats the legacy "cn" prefix as Chinese too', () => {
      setBrowserLanguages(['cn-Hans'])
      expect(useSettingsStore().language).toBe('zh')
    })

    it('prefers a persisted value over the browser preference', () => {
      setBrowserLanguages(['zh-CN'])
      localStorage.setItem(LANGUAGE_KEY, 'en')
      expect(useSettingsStore().language).toBe('en')
    })
  })

  describe('color mode', () => {
    it('defaults to system', () => {
      expect(useSettingsStore().colorMode).toBe('system')
    })

    it('reads a persisted color mode', () => {
      localStorage.setItem(COLOR_MODE_KEY, 'dark')
      expect(useSettingsStore().colorMode).toBe('dark')
    })

    it('follows explicit dark/light regardless of the system preference', () => {
      window.matchMedia = createMatchMedia(true)
      const store = useSettingsStore()

      store.colorMode = 'light'
      expect(store.isDarkMode).toBe(false)

      store.colorMode = 'dark'
      expect(store.isDarkMode).toBe(true)
    })

    it('follows the system preference while in system mode', () => {
      window.matchMedia = createMatchMedia(true)
      expect(useSettingsStore().isDarkMode).toBe(true)
    })
  })

  describe('applyColorMode', () => {
    it('toggles the dark class on <html>', () => {
      const store = useSettingsStore()

      store.colorMode = 'dark'
      store.applyColorMode()
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      store.colorMode = 'light'
      store.applyColorMode()
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('applies automatically when the color mode changes', async () => {
      const store = useSettingsStore()

      store.colorMode = 'dark'
      await nextTick()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('applyLanguage', () => {
    it('syncs the i18n locale and the document title', () => {
      const store = useSettingsStore()

      store.language = 'zh'
      store.applyLanguage()

      expect(i18n.locale.value).toBe('zh')
      expect(i18n.t).toHaveBeenCalledWith('common.title')
      expect(document.title).toBe('translated:common.title')
    })

    it('applies automatically when the language changes', async () => {
      const store = useSettingsStore()

      store.language = 'zh'
      await nextTick()
      expect(i18n.locale.value).toBe('zh')
    })
  })

  describe('persistence', () => {
    it('writes both settings under the prefixed localStorage keys', async () => {
      const store = useSettingsStore()

      store.language = 'zh'
      store.colorMode = 'dark'
      await nextTick()

      expect(localStorage.getItem(LANGUAGE_KEY)).toBe('zh')
      expect(localStorage.getItem(COLOR_MODE_KEY)).toBe('dark')
    })
  })
})
