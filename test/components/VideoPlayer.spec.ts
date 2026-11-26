import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import VideoPlayer from '../../src/runtime/components/VideoPlayer.vue'
import { renderEach } from '../component-render'
import { formatMediaTime, getBufferedEnd } from '../../src/runtime/utils/media'
import theme from '#build/ui/video-player'

const src = 'https://example.com/video.mp4'

describe('VideoPlayer', () => {
  const sizes = Object.keys(theme.variants.size) as any

  renderEach(VideoPlayer, [
    // Props
    ['with src', { props: { src } }],
    ['with sources', { props: { src: [{ src: 'https://example.com/video.webm', type: 'video/webm' }, { src, type: 'video/mp4' }] } }],
    ['with poster', { props: { src, poster: 'https://example.com/poster.jpg' } }],
    ['with tracks', { props: { src, tracks: [{ src: '/en.vtt', srclang: 'en', label: 'English', default: true }, { src: '/fr.vtt', srclang: 'fr', label: 'Français' }] } }],
    ['with autoplay muted loop', { props: { src, autoplay: true, muted: true, loop: true } }],
    ['without controls', { props: { src, controls: false } }],
    ['without playbackRates', { props: { src, playbackRates: [] } }],
    ['with color neutral', { props: { src, color: 'neutral' } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { src, size } }]),
    ['with playIcon', { props: { src, playIcon: 'i-lucide-circle-play' } }],
    ['with as', { props: { src, as: 'section' } }],
    ['with class', { props: { src, class: 'rounded-none' } }],
    ['with ui', { props: { src, ui: { controls: 'px-6' } } }],
    // Slots
    ['with overlay slot', { props: { src }, slots: { overlay: () => 'Overlay slot' } }],
    ['with controls slot', { props: { src }, slots: { controls: () => 'Controls slot' } }],
    ['with leading slot', { props: { src }, slots: { leading: () => 'Leading slot' } }],
    ['with trailing slot', { props: { src }, slots: { trailing: () => 'Trailing slot' } }]
  ])

  it('passes accessibility tests', async () => {
    const wrapper = await mountSuspended(VideoPlayer, {
      props: { src, tracks: [{ src: '/en.vtt', srclang: 'en', label: 'English' }] }
    })

    expect(await axe(wrapper.element)).toHaveNoViolations()
  })

  describe('playback', () => {
    let play: ReturnType<typeof vi.spyOn>
    let pause: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event('play'))
        return Promise.resolve()
      })
      pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event('pause'))
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('plays from the overlay button and toggles from the control bar', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src } })

      await wrapper.get('[data-slot="play"]').trigger('click')
      expect(play).toHaveBeenCalledTimes(1)
      expect(wrapper.emitted('play')).toHaveLength(1)
      expect(wrapper.get('[data-slot="root"]').attributes('data-state')).toBe('playing')
      expect(wrapper.find('[data-slot="play"]').exists()).toBe(false)
      expect(wrapper.get('[data-slot="bar"] button').attributes('aria-label')).toBe('Pause')
    })

    it('toggles playback with the keyboard', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src } })

      await wrapper.get('[data-slot="root"]').trigger('keydown', { key: 'k' })
      expect(play).toHaveBeenCalledTimes(1)
    })

    it('ignores the space key on buttons, which activate themselves', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src } })

      await wrapper.get('[data-slot="bar"] button').trigger('keydown', { key: ' ' })
      expect(play).not.toHaveBeenCalled()
    })

    it('toggles playback on a click on the video', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src } })

      await wrapper.get('video').trigger('click')
      expect(play).toHaveBeenCalledTimes(1)
    })

    it('exposes the playback methods', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src } })
      const vm = wrapper.vm as any

      vm.play()
      vm.pause()
      expect(play).toHaveBeenCalledTimes(1)
      expect(pause).toHaveBeenCalledTimes(1)
      expect(vm.videoRef).toBeInstanceOf(HTMLVideoElement)
    })
  })

  describe('volume', () => {
    it('mutes from the mute button and emits update:muted', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src } })

      const mute = wrapper.get('[data-slot="volume"] button')
      expect(mute.attributes('aria-pressed')).toBe('false')

      await mute.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('update:muted')?.[0]).toEqual([true])
      expect((wrapper.get('video').element as HTMLVideoElement).muted).toBe(true)
    })

    it('applies the volume model to the video', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src, volume: 0.4 } })

      expect((wrapper.get('video').element as HTMLVideoElement).volume).toBe(0.4)

      await wrapper.setProps({ volume: 0.8 })
      expect((wrapper.get('video').element as HTMLVideoElement).volume).toBe(0.8)
    })

    it('restores the volume when unmuting at zero', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src, volume: 0 } })

      await wrapper.get('[data-slot="volume"] button').trigger('click')
      expect(wrapper.emitted('update:volume')?.[0]).toEqual([1])
    })

    it('changes the volume with the arrow keys', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src, volume: 0.5 } })

      await wrapper.get('[data-slot="root"]').trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.emitted('update:volume')?.[0]).toEqual([0.45])
    })
  })

  describe('playback rate', () => {
    it('applies the playbackRate model to the video', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src, playbackRate: 1.5 } })

      expect((wrapper.get('video').element as HTMLVideoElement).playbackRate).toBe(1.5)
    })

    it('hides the settings menu without playback rates or tracks', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src, playbackRates: [] } })

      expect(wrapper.find('[aria-label="Settings"]').exists()).toBe(false)
    })
  })

  describe('captions', () => {
    it('only shows the captions button with subtitles or captions tracks', async () => {
      const without = await mountSuspended(VideoPlayer, { props: { src, tracks: [{ src: '/chapters.vtt', kind: 'chapters' }] } })
      expect(without.find('[aria-label="Captions"]').exists()).toBe(false)

      const withTracks = await mountSuspended(VideoPlayer, { props: { src, tracks: [{ src: '/en.vtt', srclang: 'en' }] } })
      expect(withTracks.find('[aria-label="Captions"]').exists()).toBe(true)
    })

    it('renders the tracks as subtitles by default', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src, tracks: [{ src: '/en.vtt', srclang: 'en', label: 'English' }] } })

      const track = wrapper.get('track')
      expect(track.attributes('kind')).toBe('subtitles')
      expect(track.attributes('srclang')).toBe('en')
    })
  })

  describe('progress', () => {
    it('labels the seek slider and disables it until the duration is known', async () => {
      const wrapper = await mountSuspended(VideoPlayer, { props: { src } })

      const thumb = wrapper.get('[data-slot="progressThumb"]')
      expect(thumb.attributes('aria-label')).toBe('Seek')
      expect(thumb.attributes('aria-valuetext')).toBe('0:00 / 0:00')
      expect(wrapper.get('[data-slot="progress"]').attributes('data-disabled')).toBeDefined()
    })
  })

  it('names the root region and lets a caller override it', async () => {
    const wrapper = await mountSuspended(VideoPlayer, { props: { src } })
    expect(wrapper.get('[data-slot="root"]').attributes('aria-label')).toBe('Video player')

    const named = await mountSuspended(VideoPlayer, { props: { src }, attrs: { 'aria-label': 'Product demo' } })
    expect(named.get('[data-slot="root"]').attributes('aria-label')).toBe('Product demo')
  })
})

describe('media utils', () => {
  it('formats media time', () => {
    expect(formatMediaTime(undefined)).toBe('0:00')
    expect(formatMediaTime(Number.NaN)).toBe('0:00')
    expect(formatMediaTime(Infinity)).toBe('0:00')
    expect(formatMediaTime(-1)).toBe('0:00')
    expect(formatMediaTime(5.9)).toBe('0:05')
    expect(formatMediaTime(65)).toBe('1:05')
    expect(formatMediaTime(3725)).toBe('1:02:05')
  })

  it('finds the end of the buffered range around a time', () => {
    const ranges = [[0, 10], [20, 30]]
    const buffered = {
      length: ranges.length,
      start: (i: number) => ranges[i]![0]!,
      end: (i: number) => ranges[i]![1]!
    } as TimeRanges

    expect(getBufferedEnd(buffered, 5)).toBe(10)
    expect(getBufferedEnd(buffered, 25)).toBe(30)
    expect(getBufferedEnd(buffered, 15)).toBe(15)
    expect(getBufferedEnd(undefined, 3)).toBe(3)
  })
})
