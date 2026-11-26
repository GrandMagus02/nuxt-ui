import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ChatAudio from '../../src/runtime/components/ChatAudio.vue'
import ChatMessage from '../../src/runtime/components/ChatMessage.vue'
import { renderEach } from '../component-render'
import theme from '#build/ui/chat-audio'

describe('ChatAudio', () => {
  const sizes = Object.keys(theme.variants.size) as any
  const variants = Object.keys(theme.variants.variant) as any

  const peaks = [0.2, 0.5, 1, 0.7, 0.3, 0.8, 0.4, 0.6]
  const props = { src: 'data:audio/wav;base64,', peaks, duration: 42, bars: 8 }

  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
      Object.defineProperty(this, 'paused', { configurable: true, value: false })
      this.dispatchEvent(new Event('play'))
      return Promise.resolve()
    })
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
      Object.defineProperty(this, 'paused', { configurable: true, value: true })
      this.dispatchEvent(new Event('pause'))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  renderEach(ChatAudio, [
    // Props
    ['with src', { props }],
    ['without peaks', { props: { duration: 12, bars: 8 } }],
    ['with bars', { props: { ...props, bars: 4 } }],
    ['with disabled', { props: { ...props, disabled: true } }],
    ['with removable', { props: { ...props, removable: true } }],
    ['with color neutral', { props: { ...props, color: 'neutral' } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { ...props, size } }]),
    ...variants.map((variant: string) => [`with primary variant ${variant}`, { props: { ...props, variant } }]),
    ...variants.map((variant: string) => [`with neutral variant ${variant}`, { props: { ...props, color: 'neutral', variant } }]),
    ['with playIcon', { props: { ...props, playIcon: 'i-lucide-circle-play' } }],
    ['with removeIcon', { props: { ...props, removable: true, removeIcon: 'i-lucide-trash' } }],
    ['with as', { props: { ...props, as: 'section' } }],
    ['with class', { props: { ...props, class: 'w-64' } }],
    ['with ui', { props: { ...props, ui: { bar: 'rounded-none' } } }],
    // Slots
    ['with time slot', { props, slots: { time: () => 'Time slot' } }]
  ])

  it('renders one bar per `bars` with the resampled peaks', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props: { ...props, bars: 4 } })

    const bars = wrapper.findAll('[data-slot="bar"]')
    expect(bars).toHaveLength(4)
    expect(bars[1]!.attributes('style')).toContain('height: 100%')
  })

  it('displays the duration before playing', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props: { ...props, duration: 75 } })

    expect(wrapper.find('[data-slot="time"]').text()).toBe('1:15')
  })

  it('toggles playback with the play button', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props })

    const button = wrapper.find('[data-slot="play"]')
    expect(button.attributes('aria-label')).toBe('Play')

    await button.trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
    expect(wrapper.find('[data-slot="root"]').attributes('data-state')).toBe('playing')
    expect(button.attributes('aria-label')).toBe('Pause')

    await button.trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
    expect(wrapper.find('[data-slot="root"]').attributes('data-state')).toBe('paused')
  })

  it('pauses the other players when one starts', async () => {
    const first = await mountSuspended(ChatAudio, { props })
    const second = await mountSuspended(ChatAudio, { props })

    await first.find('[data-slot="play"]').trigger('click')
    await second.find('[data-slot="play"]').trigger('click')

    expect(first.emitted('pause')).toHaveLength(1)
    expect(second.find('[data-slot="root"]').attributes('data-state')).toBe('playing')
  })

  it('seeks with the keyboard', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props: { ...props, step: 10 } })

    const slider = wrapper.find('[data-slot="waveform"]')
    expect(slider.attributes('role')).toBe('slider')
    expect(slider.attributes('aria-valuemax')).toBe('42')

    await slider.trigger('keydown', { key: 'ArrowRight' })
    expect(slider.attributes('aria-valuenow')).toBe('10')
    expect(slider.attributes('aria-valuetext')).toBe('0:10 / 0:42')

    await slider.trigger('keydown', { key: 'End' })
    expect(slider.attributes('aria-valuenow')).toBe('42')

    await slider.trigger('keydown', { key: 'Home' })
    expect(slider.attributes('aria-valuenow')).toBe('0')
  })

  it('marks the played bars', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props: { ...props, duration: 8, step: 4 } })

    await wrapper.find('[data-slot="waveform"]').trigger('keydown', { key: 'ArrowRight' })

    const played = wrapper.findAll('[data-slot="bar"]').map(bar => bar.attributes('data-played'))
    expect(played).toEqual(['true', 'true', 'true', 'true', 'false', 'false', 'false', 'false'])
  })

  it('does not seek or play when disabled', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props: { ...props, disabled: true } })

    await wrapper.find('[data-slot="waveform"]').trigger('keydown', { key: 'End' })
    expect(wrapper.find('[data-slot="waveform"]').attributes('aria-valuenow')).toBe('0')
    expect(wrapper.find('[data-slot="play"]').attributes('disabled')).toBeDefined()
  })

  it('emits remove when the remove button is clicked', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props: { ...props, removable: true } })

    const button = wrapper.find('[data-slot="remove"]')
    expect(button.attributes('aria-label')).toBe('Remove voice message')

    await button.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('takes the style of the enclosing message', async () => {
    const mountIn = (messageProps: Record<string, any>, audioProps: Record<string, any> = {}) => mountSuspended({
      components: { ChatMessage, ChatAudio },
      setup: () => ({ messageProps, audioProps: { ...props, ...audioProps } }),
      template: '<ChatMessage id="1" role="user" :parts="[]" v-bind="messageProps"><template #header><ChatAudio v-bind="audioProps" /></template></ChatMessage>'
    })

    const solid = await mountIn({ color: 'primary', variant: 'solid' })
    expect(solid.find('[data-slot="time"]').element.parentElement!.className).toContain('bg-primary text-inverted')

    const compact = await mountIn({ variant: 'soft', compact: true })
    expect(compact.find('[data-slot="time"]').element.parentElement!.className).toContain('min-h-8')

    // A message without a variant is `naked` by default
    const naked = await mountIn({})
    expect(naked.find('[data-slot="time"]').element.parentElement!.className).toContain('p-0')

    const explicit = await mountIn({ color: 'primary', variant: 'solid' }, { color: 'neutral', variant: 'outline' })
    expect(explicit.find('[data-slot="time"]').element.parentElement!.className).toContain('bg-default ring ring-default')
  })

  it('passes accessibility tests', async () => {
    const wrapper = await mountSuspended(ChatAudio, { props: { ...props, removable: true } })

    expect(await axe(wrapper.element)).toHaveNoViolations()
  })
})
