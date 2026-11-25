import { describe, it, expect, vi, afterAll, afterEach, test } from 'vitest'
import { axe } from 'vitest-axe'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { renderEach } from '../component-render'
import InputDuration from '../../src/runtime/components/InputDuration.vue'
import type { FormInputEvents } from '../../src/module'
import { renderForm } from '../utils/form'
import theme from '#build/ui/input-duration'

// 1h 30m 15s
const DURATION = 5_415_000

describe('InputDuration', () => {
  const sizes = Object.keys(theme.variants.size) as any
  const variants = Object.keys(theme.variants.variant) as any
  const date = new Date('2025-01-01')

  vi.setSystemTime(date)

  afterEach(() => {
    vi.setSystemTime(date)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  renderEach(InputDuration, [
    // Props
    ['with modelValue', { props: { modelValue: DURATION } }],
    ['with default value', { props: { defaultValue: DURATION } }],
    ['with all units', { props: { units: ['weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'], modelValue: 694_861_001 } }],
    ['with units', { props: { units: ['minutes', 'seconds'], modelValue: DURATION } }],
    ['with unitDisplay long', { props: { unitDisplay: 'long', modelValue: DURATION } }],
    ['with disabled', { props: { disabled: true, modelValue: DURATION } }],
    ['with required', { props: { required: true, modelValue: DURATION } }],
    ['with readonly', { props: { readonly: true, modelValue: DURATION } }],
    ['with max value', { props: { maxValue: 3_600_000, modelValue: DURATION } }],
    ['with min value', { props: { minValue: 3_600_000 } }],
    ['with icon', { props: { icon: 'i-lucide-timer' } }],
    ['with leadingIcon', { props: { leadingIcon: 'i-lucide-arrow-left' } }],
    ['with trailingIcon', { props: { trailingIcon: 'i-lucide-arrow-right' } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ...variants.map((variant: string) => [`with primary variant ${variant}`, { props: { variant, defaultValue: DURATION } }]),
    ...variants.map((variant: string) => [`with primary variant ${variant} highlight`, { props: { variant, highlight: true, defaultValue: DURATION } }]),
    ...variants.map((variant: string) => [`with neutral variant ${variant}`, { props: { variant, color: 'neutral', defaultValue: DURATION } }]),
    ...variants.map((variant: string) => [`with neutral variant ${variant} highlight`, { props: { variant, color: 'neutral', highlight: true, defaultValue: DURATION } }]),
    ['with ariaLabel', { attrs: { 'aria-label': 'Aria label' } }],
    ['with as', { props: { as: 'section' } }],
    ['with class', { props: { class: 'max-w-sm' } }],
    ['with ui', { props: { ui: { base: 'rounded-full' } } }],
    // Slots
    ['with leading slot', { slots: { leading: () => 'Leading slot' } }],
    ['with default slot', { slots: { default: () => 'Default slot' } }],
    ['with trailing slot', { slots: { trailing: () => 'Trailing slot' } }]
  ])

  function getSegments(wrapper: any) {
    return wrapper.findAll('[role="spinbutton"]')
  }

  describe('segments', () => {
    test('splits the model into the displayed units', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { modelValue: DURATION } })
      expect(getSegments(wrapper).map((s: any) => s.text())).toEqual(['1', '30', '15'])
    })

    test('the largest unit absorbs the larger ones', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { units: ['minutes', 'seconds'], modelValue: DURATION } })
      expect(getSegments(wrapper).map((s: any) => s.text())).toEqual(['90', '15'])
    })

    test('exposes spinbutton attributes', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { modelValue: DURATION } })
      const [hours, minutes] = getSegments(wrapper)

      expect(hours.attributes()).toMatchObject({
        'aria-label': 'hours',
        'aria-valuemin': '0',
        'aria-valuemax': '999',
        'aria-valuenow': '1',
        'aria-valuetext': '1 hour',
        'inputmode': 'numeric',
        'tabindex': '0'
      })
      expect(minutes.attributes('aria-valuemax')).toBe('59')
      expect(wrapper.attributes('role')).toBe('group')
    })
  })

  describe('keyboard', () => {
    test('typing digits fills segments, auto-advances and emits milliseconds', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { defaultValue: 0 }, attachTo: document.body })
      const [, minutes, seconds] = getSegments(wrapper)

      ;(minutes.element as HTMLElement).focus()
      await minutes.trigger('keydown', { key: '1' })
      await minutes.trigger('keydown', { key: '2' })
      expect(document.activeElement).toBe(seconds.element)

      await seconds.trigger('keydown', { key: '3' })
      await seconds.trigger('keydown', { key: '0' })

      expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([12 * 60_000 + 30_000])
      wrapper.unmount()
    })

    test('arrow keys step and wrap bounded units', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { units: ['hours', 'minutes'], defaultValue: 0, step: { minutes: 15 } } })
      const [hours, minutes] = getSegments(wrapper)

      await minutes.trigger('keydown', { key: 'ArrowDown' })
      expect(minutes.text()).toBe('45')
      expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([45 * 60_000])

      await hours.trigger('keydown', { key: 'ArrowDown' })
      expect(hours.text()).toBe('0')
    })

    test('backspace clears the segment and the model', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { defaultValue: DURATION } })
      const [hours] = getSegments(wrapper)

      await hours.trigger('keydown', { key: 'Backspace' })
      expect(hours.attributes('data-placeholder')).toBeDefined()
      expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null])
    })

    test('leaving a partially filled field fills empty segments with zero', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { units: ['hours', 'minutes'] } })
      const [hours] = getSegments(wrapper)

      vi.setSystemTime(new Date(date.getTime() + 1000))
      await hours.trigger('keydown', { key: '2' })
      hours.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([2 * 3_600_000])
    })

    test('readonly ignores input', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { readonly: true, defaultValue: DURATION } })
      const [hours] = getSegments(wrapper)

      await hours.trigger('keydown', { key: 'ArrowUp' })
      expect(hours.text()).toBe('1')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('emits', () => {
    test('update:modelValue event', async () => {
      const wrapper = await mountSuspended(InputDuration, { props: { defaultValue: 0 } })
      const [hours] = getSegments(wrapper)

      await hours.trigger('keydown', { key: 'ArrowUp' })
      expect(wrapper.emitted()).toMatchObject({ 'update:modelValue': [[3_600_000]] })
    })

    test('focus and blur events when focus enters and leaves the field, not between segments', async () => {
      const wrapper = await mountSuspended(InputDuration)
      const [first, second] = getSegments(wrapper)

      // Vue skips native events stamped at the exact time their listener was attached
      vi.setSystemTime(new Date(date.getTime() + 1000))

      first!.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: null }))
      first!.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: second!.element }))
      second!.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: first!.element }))
      second!.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))

      expect(wrapper.emitted()).toMatchObject({ focus: [[{ type: 'focusin' }]], blur: [[{ type: 'focusout' }]] })
    })
  })

  describe('form integration', async () => {
    async function createForm(validateOn?: FormInputEvents[]) {
      const wrapper = await renderForm({
        props: {
          validateOn,
          validateOnInputDelay: 0,
          async validate(state: any) {
            if (!state.value) {
              return [{ name: 'value', message: 'Error message' }]
            }
            return []
          }
        },
        slotTemplate: `
        <UFormField name="value">
          <UInputDuration id="input" v-model="state.value" />
        </UFormField>
        `
      })

      const segments = getSegments(wrapper)

      // Vue skips native events stamped at the exact time their listener was attached
      vi.setSystemTime(new Date(date.getTime() + 1000))

      return { wrapper, segments }
    }

    test('validate on blur works', async () => {
      const { wrapper, segments } = await createForm(['blur'])
      const last = segments[segments.length - 1]!

      last.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
      await flushPromises()
      expect(wrapper.text()).toContain('Error message')

      await last.trigger('keydown', { key: '5' })
      last.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
      await flushPromises()
      expect(wrapper.text()).not.toContain('Error message')
    })

    test('validate on blur ignores focus moving between segments', async () => {
      const { wrapper, segments } = await createForm(['blur'])
      const [first, second] = segments

      first!.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: second!.element }))
      await flushPromises()
      expect(wrapper.text()).not.toContain('Error message')
    })
  })

  it('passes accessibility tests', async () => {
    const wrapper = await mountSuspended(InputDuration, {
      props: {
        modelValue: DURATION
      }
    })

    expect(await axe(wrapper.element)).toHaveNoViolations()
  })
})
