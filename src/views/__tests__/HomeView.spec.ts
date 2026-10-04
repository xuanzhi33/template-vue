import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import { i18n } from '@/i18n/config'
import HomeView from '@/views/HomeView.vue'

const SettingsStub = defineComponent({
  name: 'SettingsStub',
  render: () => h('div', 'settings'),
})

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/settings', name: 'settings', component: SettingsStub },
    ],
  })
}

beforeEach(() => {
  i18n.global.locale.value = 'en'
})

describe('HomeView', () => {
  it('renders the translated title', async () => {
    const router = createTestRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(HomeView, { global: { plugins: [i18n, router] } })

    expect(wrapper.text()).toContain('Vue Project Template')
  })

  it('navigates to the settings route when the button is clicked', async () => {
    const router = createTestRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(HomeView, { global: { plugins: [i18n, router] } })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/settings')
  })
})
