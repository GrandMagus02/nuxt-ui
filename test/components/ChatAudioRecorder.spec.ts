import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ChatAudioRecorder from '../../src/runtime/components/ChatAudioRecorder.vue'
import { renderEach } from '../component-render'
import theme from '#build/ui/chat-audio-recorder'

class MockMediaRecorder {
  static isTypeSupported = (type: string) => type.startsWith('audio/webm')
  state: 'inactive' | 'recording' = 'inactive'
  mimeType: string
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(_stream: MediaStream, options?: { mimeType?: string }) {
    this.mimeType = options?.mimeType ?? 'audio/webm'
  }

  start() {
    this.state = 'recording'
  }

  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['voice'], { type: this.mimeType }) })
    this.onstop?.()
  }
}

class MockAudioContext {
  createAnalyser() {
    return { fftSize: 0, getFloatTimeDomainData: (data: Float32Array) => data.fill(0.25) }
  }

  createMediaStreamSource() {
    return { connect: () => {} }
  }

  close() {
    return Promise.resolve()
  }
}

describe('ChatAudioRecorder', () => {
  const sizes = Object.keys(theme.variants.size) as any

  const track = { stop: vi.fn() }
  const getUserMedia = vi.fn()

  beforeEach(() => {
    track.stop.mockClear()
    getUserMedia.mockReset().mockResolvedValue({ getTracks: () => [track] })
    vi.stubGlobal('MediaRecorder', MockMediaRecorder)
    vi.stubGlobal('AudioContext', MockAudioContext)
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  renderEach(ChatAudioRecorder, [
    // Props
    ['with icon', { props: { icon: 'i-lucide-mic-vocal' } }],
    ['with color', { props: { color: 'primary' } }],
    ['with variant', { props: { variant: 'soft' } }],
    ['with disabled', { props: { disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ['with as', { props: { as: 'section' } }],
    ['with class', { props: { class: 'ms-auto' } }],
    ['with ui', { props: { ui: { trigger: 'rounded-full' } } }],
    // Slots
    ['with default slot', { slots: { default: () => 'Default slot' } }]
  ])

  async function startRecording(props = {}) {
    const wrapper = await mountSuspended(ChatAudioRecorder, { props })
    await wrapper.find('[data-slot="trigger"]').trigger('click')
    await flushPromises()
    return wrapper
  }

  it('records and emits a file when stopped', async () => {
    const wrapper = await startRecording({ name: 'memo', bars: 6 })

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(wrapper.emitted('start')).toHaveLength(1)
    expect(wrapper.find('[data-slot="root"]').attributes('data-state')).toBe('recording')
    expect(wrapper.findAll('[data-slot="bar"]')).toHaveLength(6)

    await wrapper.find('[data-slot="stop"]').trigger('click')

    const [file, record] = wrapper.emitted('record')![0] as [File, { duration: number, peaks: number[] }]
    expect(file).toBeInstanceOf(File)
    expect(file.name).toMatch(/^memo-\d+\.webm$/)
    expect(file.type).toBe('audio/webm')
    expect(record.duration).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(record.peaks)).toBe(true)

    expect(track.stop).toHaveBeenCalled()
    expect(wrapper.find('[data-slot="root"]').attributes('data-state')).toBe('idle')
  })

  it('discards the recording when canceled', async () => {
    const wrapper = await startRecording()

    await wrapper.find('[data-slot="cancel"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('record')).toBeUndefined()
    expect(track.stop).toHaveBeenCalled()
  })

  it('cancels the recording on escape', async () => {
    const wrapper = await startRecording()

    await wrapper.find('[data-slot="root"]').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits an error when the microphone access is denied', async () => {
    getUserMedia.mockRejectedValue(new Error('Permission denied'))

    const wrapper = await startRecording()

    expect((wrapper.emitted('error')![0]![0] as Error).message).toBe('Permission denied')
    expect(wrapper.find('[data-slot="root"]').attributes('data-state')).toBe('idle')
  })

  it('emits an error when recording is not supported', async () => {
    vi.stubGlobal('MediaRecorder', undefined)

    const wrapper = await startRecording()

    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('does not start when disabled', async () => {
    const wrapper = await startRecording({ disabled: true })

    expect(getUserMedia).not.toHaveBeenCalled()
    expect(wrapper.emitted('start')).toBeUndefined()
  })

  it('passes accessibility tests', async () => {
    const wrapper = await mountSuspended(ChatAudioRecorder)

    expect(await axe(wrapper.element)).toHaveNoViolations()
  })

  it('passes accessibility tests while recording', async () => {
    const wrapper = await startRecording()

    expect(await axe(wrapper.element)).toHaveNoViolations()
  })
})
