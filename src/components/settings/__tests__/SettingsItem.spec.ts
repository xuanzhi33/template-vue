import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Settings } from 'lucide-vue-next'
import SettingsItem from '@/components/settings/SettingsItem.vue'

const options = [
  { label: 'Light Mode', value: 'light' },
  { label: 'Dark Mode', value: 'dark' },
]

describe('SettingsItem', () => {
  it('renders the label and description', () => {
    const wrapper = mount(SettingsItem, {
      props: { label: 'Language', description: 'Pick a language' },
    })

    expect(wrapper.text()).toContain('Language')
    expect(wrapper.text()).toContain('Pick a language')
  })

  it('renders the icon when provided', () => {
    const wrapper = mount(SettingsItem, { props: { label: 'Theme', icon: Settings } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('defaults to a text input and reflects modelValue', () => {
    const wrapper = mount(SettingsItem, { props: { label: 'Name', modelValue: 'foo' } })

    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('input')
    expect((input.element as HTMLInputElement).value).toBe('foo')
  })

  it('renders a password input', () => {
    const wrapper = mount(SettingsItem, { props: { label: 'Token', type: 'password' } })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('emits update:modelValue when the input changes', async () => {
    const wrapper = mount(SettingsItem, { props: { label: 'Name', modelValue: 'foo' } })

    await wrapper.find('input').setValue('bar')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['bar'])
  })

  describe('select mode', () => {
    it('shows the placeholder when nothing is selected', () => {
      const wrapper = mount(SettingsItem, {
        props: { label: 'Color', type: 'select', options, placeholder: 'Pick one' },
      })

      expect(wrapper.text()).toContain('Pick one')
    })

    it('shows the label of the selected option', () => {
      const wrapper = mount(SettingsItem, {
        props: { label: 'Color', type: 'select', options, modelValue: 'dark' },
      })

      expect(wrapper.text()).toContain('Dark Mode')
    })

    it('emits the new value when an option is picked', async () => {
      const wrapper = mount(SettingsItem, {
        attachTo: document.body,
        props: { label: 'Color', type: 'select', options, modelValue: 'light' },
      })

      await wrapper.find('[role="combobox"]').trigger('pointerdown')
      await nextTick()

      const renderedOptions = document.body.querySelectorAll('[role="option"]')
      expect(renderedOptions).toHaveLength(options.length)

      const darkOption = renderedOptions.item(1)
      expect(darkOption).not.toBeNull()
      darkOption?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
      await nextTick()

      const updates = wrapper.emitted<string[]>('update:modelValue') ?? []
      expect(updates[updates.length - 1]).toEqual(['dark'])

      wrapper.unmount()
    })
  })
})
