import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import App from '@/App.vue'
import { LOCAL_STORAGE_KEY_PREFIX, useSettingsStore } from '@/stores/settings'

// App.vue only touches the store; the store calls useI18n() at setup time.
// Mock it so the store can also be created directly here for spying.
const i18n = vi.hoisted(() => ({
  locale: { value: 'en' },
  t: vi.fn((key: string) => `translated:${key}`),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: i18n.locale, t: i18n.t }),
}))

const EmptyView = defineComponent({
  name: 'EmptyView',
  render: () => h('div', 'home'),
})

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: EmptyView }],
  })
}

async function mountApp(pinia: ReturnType<typeof createPinia>) {
  setActivePinia(pinia)
  const router = createTestRouter()
  await router.push('/')
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  i18n.locale.value = 'en'
  i18n.t.mockClear()
})

describe('App', () => {
  it('applies the persisted settings on mount', async () => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}color-mode`, 'dark')

    await mountApp(createPinia())

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.title).toBe('translated:common.title')
  })

  it('calls applyColorMode and applyLanguage once mounted', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useSettingsStore()
    const applyColorMode = vi.spyOn(store, 'applyColorMode')
    const applyLanguage = vi.spyOn(store, 'applyLanguage')

    await mountApp(pinia)

    expect(applyColorMode).toHaveBeenCalledTimes(1)
    expect(applyLanguage).toHaveBeenCalledTimes(1)
  })
})
