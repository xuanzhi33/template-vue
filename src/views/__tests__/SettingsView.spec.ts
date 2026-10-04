import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { i18n } from '@/i18n/config'
import SettingsView from '@/views/SettingsView.vue'
import { useSettingsStore } from '@/stores/settings'

beforeEach(() => {
  i18n.global.locale.value = 'en'
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(SettingsView, { global: { plugins: [pinia, i18n] } })
}

describe('SettingsView', () => {
  it('renders the translated titles and current values', () => {
    const wrapper = mountView()

    expect(wrapper.text()).toContain('Settings')
    expect(wrapper.text()).toContain('User Interface')
    expect(wrapper.text()).toContain('Follow System')
    expect(wrapper.text()).toContain('English')
  })

  it('reflects a color mode change from the store', async () => {
    const wrapper = mountView()
    const store = useSettingsStore()

    store.colorMode = 'dark'
    await nextTick()

    expect(wrapper.text()).toContain('Dark Mode')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('re-renders when the language changes', async () => {
    const wrapper = mountView()
    const store = useSettingsStore()

    store.language = 'zh'
    await nextTick()
    await nextTick()

    expect(i18n.global.locale.value).toBe('zh')
    expect(wrapper.text()).toContain('设置')
  })
})
