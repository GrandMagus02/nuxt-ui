<script lang="ts">
import type { VNode } from 'vue'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/video-player'
import type { IconProps } from './Icon.vue'
import type { DropdownMenuItem } from './DropdownMenu.vue'
import type { ComponentConfig } from '../types/tv'

type VideoPlayer = ComponentConfig<typeof theme, AppConfig, 'videoPlayer'>

export interface VideoPlayerSource {
  src: string
  /** The media type of the source, such as `video/webm`, so the browser can skip formats it can't play. */
  type?: string
  /** A media query the source applies to. */
  media?: string
}

export interface VideoPlayerTrack {
  src: string
  /** @defaultValue 'subtitles' */
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  /** The language of the track, such as `en`. */
  srclang?: string
  /** The name of the track in the captions menu. */
  label?: string
  /** Show the track by default. */
  default?: boolean
}

export interface VideoPlayerProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  /**
   * The URL of the video, or several sources for the browser to pick the first it can play.
   */
  src?: string | VideoPlayerSource[]
  /**
   * The image displayed until the video plays.
   */
  poster?: string
  /**
   * Text tracks such as subtitles or captions, in WebVTT format.
   */
  tracks?: VideoPlayerTrack[]
  /**
   * Start playing as soon as possible. Browsers only allow it when the video is `muted`.
   * @defaultValue false
   */
  autoplay?: boolean
  /**
   * Restart the video when it ends.
   * @defaultValue false
   */
  loop?: boolean
  /**
   * Play inline on iOS instead of entering fullscreen.
   * @defaultValue true
   */
  playsinline?: boolean
  /**
   * How much of the video to load before it plays.
   * @defaultValue 'metadata'
   */
  preload?: 'none' | 'metadata' | 'auto'
  /**
   * How the video is fetched across origins. Required to load tracks from another origin.
   */
  crossorigin?: '' | 'anonymous' | 'use-credentials'
  /**
   * Display the controls.
   * @defaultValue true
   */
  controls?: boolean
  /**
   * The delay in milliseconds after which the controls hide while playing, or `false` to always show them.
   * @defaultValue 2500
   */
  autoHide?: number | false
  /**
   * The playback speeds offered in the settings menu. An empty array hides them.
   * @defaultValue [0.5, 0.75, 1, 1.25, 1.5, 2]
   */
  playbackRates?: number[]
  /**
   * The number of seconds the arrow keys seek by.
   * @defaultValue 5
   */
  step?: number
  /**
   * Display a button to toggle fullscreen when the browser supports it.
   * @defaultValue true
   */
  fullscreen?: boolean
  /**
   * Display a button to toggle picture-in-picture when the browser supports it.
   * @defaultValue true
   */
  pictureInPicture?: boolean
  /**
   * @defaultValue 'primary'
   */
  color?: VideoPlayer['variants']['color']
  /**
   * @defaultValue 'md'
   */
  size?: VideoPlayer['variants']['size']
  /**
   * The icon of the play button.
   * @defaultValue appConfig.ui.icons.play
   * @IconifyIcon
   */
  playIcon?: IconProps['name']
  /**
   * The icon of the pause button.
   * @defaultValue appConfig.ui.icons.pause
   * @IconifyIcon
   */
  pauseIcon?: IconProps['name']
  /**
   * The icon of the mute button.
   * @defaultValue appConfig.ui.icons.volume
   * @IconifyIcon
   */
  volumeIcon?: IconProps['name']
  /**
   * The icon of the mute button when muted.
   * @defaultValue appConfig.ui.icons.volumeOff
   * @IconifyIcon
   */
  volumeOffIcon?: IconProps['name']
  /**
   * The icon of the captions button.
   * @defaultValue appConfig.ui.icons.captions
   * @IconifyIcon
   */
  captionsIcon?: IconProps['name']
  /**
   * The icon of the settings button.
   * @defaultValue appConfig.ui.icons.settings
   * @IconifyIcon
   */
  settingsIcon?: IconProps['name']
  /**
   * The icon of the picture-in-picture button.
   * @defaultValue appConfig.ui.icons.pictureInPicture
   * @IconifyIcon
   */
  pictureInPictureIcon?: IconProps['name']
  /**
   * The icon of the fullscreen button.
   * @defaultValue appConfig.ui.icons.fullscreen
   * @IconifyIcon
   */
  fullscreenIcon?: IconProps['name']
  /**
   * The icon of the fullscreen button in fullscreen.
   * @defaultValue appConfig.ui.icons.fullscreenExit
   * @IconifyIcon
   */
  fullscreenExitIcon?: IconProps['name']
  /**
   * The icon displayed while the video is buffering.
   * @defaultValue appConfig.ui.icons.loading
   * @IconifyIcon
   */
  loadingIcon?: IconProps['name']
  class?: any
  ui?: VideoPlayer['slots']
}

export interface VideoPlayerEmits {
  play: [event: Event]
  pause: [event: Event]
  ended: [event: Event]
  error: [event: Event]
  timeupdate: [event: Event]
  loadedmetadata: [event: Event]
  fullscreenchange: [value: boolean]
}

export interface VideoPlayerState {
  playing: boolean
  waiting: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playbackRate: number
  fullscreen: boolean
  pictureInPicture: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  togglePictureInPicture: () => void
}

export interface VideoPlayerSlots {
  overlay?(props: VideoPlayerState): VNode[]
  controls?(props: VideoPlayerState): VNode[]
  leading?(props: VideoPlayerState): VNode[]
  trailing?(props: VideoPlayerState): VNode[]
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { Primitive, SliderRoot, SliderRange, SliderThumb, SliderTrack } from 'reka-ui'
import { useEventListener, useRafFn } from '@vueuse/core'
import { useAppConfig } from '#imports'
import { useComponentProps } from '../composables/useComponentProps'
import { useLocale } from '../composables/useLocale'
import { formatMediaTime, getBufferedEnd } from '../utils/media'
import { tv } from '../utils/tv'
import UIcon from './Icon.vue'
import UButton from './Button.vue'
import UDropdownMenu from './DropdownMenu.vue'

const _props = withDefaults(defineProps<VideoPlayerProps>(), {
  as: 'div',
  playsinline: true,
  preload: 'metadata',
  controls: true,
  autoHide: 2500,
  playbackRates: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
  step: 5,
  fullscreen: true,
  pictureInPicture: true
})
const emits = defineEmits<VideoPlayerEmits>()
defineSlots<VideoPlayerSlots>()

/** The volume, between `0` and `1`. */
const volume = defineModel<number>('volume', { default: 1 })
/** Whether the audio is muted. */
const muted = defineModel<boolean>('muted', { default: false })
/** The playback speed, `1` being normal. */
const playbackRate = defineModel<number>('playbackRate', { default: 1 })

const props = useComponentProps('videoPlayer', _props)

const { t, dir } = useLocale()
const appConfig = useAppConfig() as VideoPlayer['AppConfig']

const rootRef = useTemplateRef<InstanceType<typeof Primitive>>('rootRef')
const videoRef = useTemplateRef<HTMLVideoElement>('videoRef')
const rootEl = computed<HTMLElement | undefined>(() => rootRef.value?.$el)

const sources = computed<VideoPlayerSource[]>(() => typeof props.src === 'string' ? [] : (props.src ?? []))
const captionTracks = computed(() => (props.tracks ?? [])
  .map((track, index) => ({ ...track, index }))
  .filter(track => !track.kind || track.kind === 'subtitles' || track.kind === 'captions'))

const playing = ref(false)
const waiting = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const bufferedEnd = ref(0)
const isFullscreen = ref(false)
const isPictureInPicture = ref(false)
const activeTrack = ref(-1)
let lastTrack: number | undefined

// Feature detection runs on mount so server and client render the same buttons
const canFullscreen = ref(false)
const canPictureInPicture = ref(false)

// `timeupdate` only fires a few times a second, follow the playhead every frame while playing
const { pause: stopTracking, resume: startTracking } = useRafFn(() => {
  if (videoRef.value) currentTime.value = videoRef.value.currentTime
}, { immediate: false })

function syncFromVideo() {
  const el = videoRef.value
  if (!el) return

  currentTime.value = el.currentTime
  duration.value = Number.isFinite(el.duration) ? el.duration : 0
  bufferedEnd.value = getBufferedEnd(el.buffered, el.currentTime)
}

function onPlay(event: Event) {
  playing.value = true
  startTracking()
  emits('play', event)
}

function onPause(event: Event) {
  playing.value = false
  stopTracking()
  syncFromVideo()
  emits('pause', event)
}

function onEnded(event: Event) {
  playing.value = false
  stopTracking()
  syncFromVideo()
  emits('ended', event)
}

function onLoadedMetadata(event: Event) {
  syncFromVideo()
  syncTracksFromVideo()
  emits('loadedmetadata', event)
}

function onTimeUpdate(event: Event) {
  const el = videoRef.value
  if (el) {
    if (!playing.value) currentTime.value = el.currentTime
    bufferedEnd.value = getBufferedEnd(el.buffered, el.currentTime)
  }
  emits('timeupdate', event)
}

function onVolumeChange() {
  const el = videoRef.value
  if (!el) return

  if (volume.value !== el.volume) volume.value = el.volume
  if (muted.value !== el.muted) muted.value = el.muted
}

function onRateChange() {
  const el = videoRef.value
  if (el && playbackRate.value !== el.playbackRate) playbackRate.value = el.playbackRate
}

watch(volume, (value) => {
  const el = videoRef.value
  const clamped = Math.min(1, Math.max(0, value ?? 1))
  if (el && el.volume !== clamped) el.volume = clamped
})

watch(muted, (value) => {
  const el = videoRef.value
  if (el && el.muted !== !!value) el.muted = !!value
})

watch(playbackRate, (value) => {
  const el = videoRef.value
  if (el && value && el.playbackRate !== value) el.playbackRate = value
})

function play() {
  videoRef.value?.play().catch(() => {})
}

function pause() {
  videoRef.value?.pause()
}

function toggle() {
  const el = videoRef.value
  if (!el) return

  if (el.paused || el.ended) {
    play()
  } else {
    pause()
  }
}

function seek(time: number) {
  const el = videoRef.value
  if (!el || !duration.value) return

  const value = Math.min(Math.max(0, time), duration.value)
  el.currentTime = value
  currentTime.value = value
}

function setVolume(value: number) {
  const clamped = Math.min(1, Math.max(0, value))
  volume.value = clamped
  if (muted.value && clamped > 0) muted.value = false
}

function toggleMute() {
  // Unmuting at zero volume would stay silent
  if (muted.value || volume.value === 0) {
    if (volume.value === 0) volume.value = 1
    muted.value = false
  } else {
    muted.value = true
  }
}

function syncTracksFromVideo() {
  const tracks = videoRef.value?.textTracks
  if (!tracks) return

  let showing = -1
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i]!.mode === 'showing') showing = i
  }
  activeTrack.value = showing
}

function setTrack(index: number) {
  const tracks = videoRef.value?.textTracks
  activeTrack.value = index
  if (index >= 0) lastTrack = index
  if (!tracks) return

  for (const track of captionTracks.value) {
    const textTrack = tracks[track.index]
    if (textTrack) textTrack.mode = track.index === index ? 'showing' : 'disabled'
  }
}

function toggleCaptions() {
  if (!captionTracks.value.length) return

  if (activeTrack.value >= 0) {
    setTrack(-1)
  } else {
    setTrack(lastTrack ?? captionTracks.value.find(track => track.default)?.index ?? captionTracks.value[0]!.index)
  }
}

function getFullscreenElement(): Element | null {
  return document.fullscreenElement ?? (document as any).webkitFullscreenElement ?? null
}

function toggleFullscreen() {
  const root = rootEl.value as any
  const video = videoRef.value as any
  if (!root || !video) return

  if (getFullscreenElement()) {
    const exit = document.exitFullscreen?.bind(document) ?? (document as any).webkitExitFullscreen?.bind(document)
    exit?.()?.catch?.(() => {})
  } else if (root.requestFullscreen) {
    root.requestFullscreen().catch(() => {})
  } else if (root.webkitRequestFullscreen) {
    root.webkitRequestFullscreen()
  } else if (video.webkitEnterFullscreen) {
    // iOS only lets the video element itself go fullscreen, with the native controls
    video.webkitEnterFullscreen()
  }
}

function onFullscreenChange() {
  const value = !!rootEl.value && getFullscreenElement() === rootEl.value
  if (value === isFullscreen.value) return

  isFullscreen.value = value
  emits('fullscreenchange', value)
}

const documentTarget = typeof document !== 'undefined' ? document : undefined
useEventListener(documentTarget, 'fullscreenchange', onFullscreenChange)
useEventListener(documentTarget, 'webkitfullscreenchange', onFullscreenChange)

function togglePictureInPicture() {
  const video = videoRef.value
  if (!video) return

  if (document.pictureInPictureElement === video) {
    document.exitPictureInPicture().catch(() => {})
  } else {
    video.requestPictureInPicture?.().catch(() => {})
  }
}

onMounted(() => {
  const root = rootEl.value as any
  const video = videoRef.value as any

  canFullscreen.value = !!(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled || root?.requestFullscreen || video?.webkitEnterFullscreen)
  canPictureInPicture.value = !!(document.pictureInPictureEnabled && video?.requestPictureInPicture && !video.disablePictureInPicture)

  const el = videoRef.value
  if (el) {
    el.volume = Math.min(1, Math.max(0, volume.value ?? 1))
    el.muted = !!muted.value
    el.playbackRate = playbackRate.value || 1
    // The video may have loaded and started before hydration attached the listeners
    if (el.readyState >= 1) syncFromVideo()
    if (!el.paused) {
      playing.value = true
      startTracking()
    }
    syncTracksFromVideo()
  }
})

// Hide the controls while playing once the pointer stops moving
const idle = ref(false)
const menuOpen = ref(false)
let idleTimer: ReturnType<typeof setTimeout> | undefined

function wake() {
  idle.value = false
  clearTimeout(idleTimer)

  if (playing.value && props.autoHide !== false && !menuOpen.value) {
    idleTimer = setTimeout(() => {
      const active = document.activeElement
      // Keep the controls visible while the keyboard is in them
      if (active && rootEl.value?.querySelector('[data-slot="controls"]')?.contains(active) && active.matches(':focus-visible')) return
      idle.value = true
    }, props.autoHide as number)
  }
}

function onPointerLeave() {
  if (playing.value && props.autoHide !== false && !menuOpen.value) {
    clearTimeout(idleTimer)
    idle.value = true
  }
}

watch([playing, menuOpen], wake)

onBeforeUnmount(() => {
  clearTimeout(idleTimer)
})

// A tap on a touch screen first reveals the hidden controls instead of toggling playback
let revealOnly = false

function onVideoPointerDown(event: PointerEvent) {
  revealOnly = event.pointerType !== 'mouse' && idle.value && props.controls
}

function onVideoClick() {
  if (revealOnly) {
    revealOnly = false
    wake()
    return
  }
  toggle()
}

function onVideoDblclick() {
  if (props.fullscreen && canFullscreen.value) toggleFullscreen()
}

function isMenuOrField(target: EventTarget | null) {
  return !!(target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"], [role="menu"], [role^="menuitem"]')
}

function onKeydown(event: KeyboardEvent) {
  wake()

  if (event.ctrlKey || event.metaKey || event.altKey || isMenuOrField(event.target)) return

  const target = event.target as HTMLElement
  const onButton = !!target.closest?.('button, a')
  const onSlider = target.getAttribute?.('role') === 'slider'
  const forward = dir.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const backward = dir.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

  switch (event.key) {
    case ' ':
      if (onButton) return
      toggle()
      break
    case 'k':
    case 'K':
      toggle()
      break
    case forward:
      if (onSlider) return
      seek(currentTime.value + props.step)
      break
    case backward:
      if (onSlider) return
      seek(currentTime.value - props.step)
      break
    case 'ArrowUp':
      if (onSlider) return
      setVolume(Math.round(((muted.value ? 0 : volume.value) + 0.05) * 100) / 100)
      break
    case 'ArrowDown':
      if (onSlider) return
      setVolume(Math.round((volume.value - 0.05) * 100) / 100)
      break
    case 'm':
    case 'M':
      toggleMute()
      break
    case 'f':
    case 'F':
      if (!props.fullscreen) return
      toggleFullscreen()
      break
    case 'c':
    case 'C':
      if (!captionTracks.value.length) return
      toggleCaptions()
      break
    default:
      return
  }
  event.preventDefault()
}

// The arrow keys of the progress slider seek by `step`, Reka UI would move by the slider's fine-grained step
function onProgressKeydown(event: KeyboardEvent) {
  const forward = dir.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const backward = dir.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

  let time: number
  switch (event.key) {
    case forward:
    case 'ArrowUp':
      time = currentTime.value + props.step
      break
    case backward:
    case 'ArrowDown':
      time = currentTime.value - props.step
      break
    case 'PageUp':
      time = currentTime.value + props.step * 2
      break
    case 'PageDown':
      time = currentTime.value - props.step * 2
      break
    case 'Home':
      time = 0
      break
    case 'End':
      time = duration.value
      break
    default:
      return
  }

  event.preventDefault()
  event.stopPropagation()
  wake()
  seek(time)
}

function onProgressUpdate(value: number[] | undefined) {
  if (value?.length) seek(value[0]!)
}

function onVolumeUpdate(value: number[] | undefined) {
  if (value?.length) setVolume(value[0]!)
}

const progressValue = computed(() => [Math.min(currentTime.value, duration.value || 0)])
const bufferedPercent = computed(() => duration.value ? Math.min(100, (bufferedEnd.value / duration.value) * 100) : 0)
const volumeValue = computed(() => [muted.value ? 0 : (volume.value ?? 1)])
const progressValueText = computed(() => `${formatMediaTime(currentTime.value)} / ${formatMediaTime(duration.value)}`)

function formatRate(rate: number) {
  return rate === 1 ? t('videoPlayer.normal') : `${rate}×`
}

function trackLabel(track: VideoPlayerTrack & { index: number }) {
  return track.label || track.srclang || String(track.index + 1)
}

const settingsItems = computed<DropdownMenuItem[]>(() => {
  const items: DropdownMenuItem[] = []

  if (props.playbackRates?.length) {
    items.push({
      label: t('videoPlayer.speed'),
      description: formatRate(playbackRate.value),
      children: props.playbackRates.map(rate => ({
        label: formatRate(rate),
        type: 'checkbox' as const,
        checked: playbackRate.value === rate,
        onUpdateChecked: () => {
          playbackRate.value = rate
        }
      }))
    })
  }

  if (captionTracks.value.length > 1) {
    const active = captionTracks.value.find(track => track.index === activeTrack.value)

    items.push({
      label: t('videoPlayer.captions'),
      description: active ? trackLabel(active) : t('videoPlayer.off'),
      children: [{
        label: t('videoPlayer.off'),
        type: 'checkbox' as const,
        checked: activeTrack.value < 0,
        onUpdateChecked: () => setTrack(-1)
      }, ...captionTracks.value.map(track => ({
        label: trackLabel(track),
        type: 'checkbox' as const,
        checked: activeTrack.value === track.index,
        onUpdateChecked: () => setTrack(track.index)
      }))]
    })
  }

  return items
})

const state = reactive({
  playing,
  waiting,
  currentTime,
  duration,
  volume,
  muted,
  playbackRate,
  fullscreen: isFullscreen,
  pictureInPicture: isPictureInPicture,
  play,
  pause,
  toggle,
  seek,
  toggleMute,
  toggleFullscreen,
  togglePictureInPicture
}) as VideoPlayerState

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() => tv({ extend: theme, ...(appConfig.ui?.videoPlayer || {}) })({
  color: props.color,
  size: props.size
}))

defineExpose({
  videoRef,
  play,
  pause,
  toggle,
  seek,
  toggleMute,
  toggleFullscreen,
  togglePictureInPicture
})
</script>

<template>
  <Primitive
    ref="rootRef"
    :as="props.as"
    role="region"
    :aria-label="t('videoPlayer.label')"
    :data-state="playing ? 'playing' : 'paused'"
    :data-idle="idle ? '' : undefined"
    :data-fullscreen="isFullscreen ? '' : undefined"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    @pointermove="wake"
    @pointerdown="wake"
    @pointerleave="onPointerLeave"
    @focusin="wake"
    @keydown="onKeydown"
  >
    <video
      ref="videoRef"
      :src="typeof props.src === 'string' ? props.src : undefined"
      :poster="props.poster"
      :autoplay="props.autoplay"
      :loop="props.loop"
      :muted="muted"
      :playsinline="props.playsinline"
      :preload="props.preload"
      :crossorigin="props.crossorigin"
      :controls="false"
      :tabindex="props.controls ? -1 : undefined"
      data-slot="video"
      :class="ui.video({ class: props.ui?.video })"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="emits('error', $event)"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="syncFromVideo"
      @timeupdate="onTimeUpdate"
      @progress="syncFromVideo"
      @volumechange="onVolumeChange"
      @ratechange="onRateChange"
      @waiting="waiting = true"
      @playing="waiting = false"
      @canplay="waiting = false"
      @enterpictureinpicture="isPictureInPicture = true"
      @leavepictureinpicture="isPictureInPicture = false"
      @pointerdown="onVideoPointerDown"
      @click="onVideoClick"
      @dblclick="onVideoDblclick"
    >
      <source
        v-for="source in sources"
        :key="source.src"
        :src="source.src"
        :type="source.type"
        :media="source.media"
      >
      <track
        v-for="track in props.tracks"
        :key="track.src"
        :src="track.src"
        :kind="track.kind || 'subtitles'"
        :srclang="track.srclang"
        :label="track.label"
        :default="track.default"
      >
    </video>

    <div data-slot="overlay" :class="ui.overlay({ class: props.ui?.overlay })">
      <slot name="overlay" v-bind="state">
        <UIcon
          v-if="waiting && playing"
          :name="props.loadingIcon || appConfig.ui.icons.loading"
          data-slot="loadingIcon"
          :class="ui.loadingIcon({ class: props.ui?.loadingIcon })"
        />
        <button
          v-else-if="props.controls && !playing"
          type="button"
          :aria-label="t('videoPlayer.play')"
          data-slot="play"
          :class="ui.play({ class: props.ui?.play })"
          @click="play"
        >
          <UIcon :name="props.playIcon || appConfig.ui.icons.play" data-slot="playIcon" :class="ui.playIcon({ class: props.ui?.playIcon })" />
        </button>
      </slot>
    </div>

    <div v-if="props.controls" data-slot="controls" :class="ui.controls({ class: props.ui?.controls })">
      <slot name="controls" v-bind="state">
        <SliderRoot
          :model-value="progressValue"
          :min="0"
          :max="duration || 1"
          :step="0.01"
          :disabled="!duration"
          data-slot="progress"
          :class="ui.progress({ class: props.ui?.progress })"
          @update:model-value="onProgressUpdate"
          @keydown.capture="onProgressKeydown"
        >
          <SliderTrack data-slot="progressTrack" :class="ui.progressTrack({ class: props.ui?.progressTrack })">
            <div data-slot="progressBuffered" :class="ui.progressBuffered({ class: props.ui?.progressBuffered })" :style="{ width: `${bufferedPercent}%` }" />
            <SliderRange data-slot="progressRange" :class="ui.progressRange({ class: props.ui?.progressRange })" />
          </SliderTrack>
          <SliderThumb
            :aria-label="t('videoPlayer.seek')"
            :aria-valuetext="progressValueText"
            data-slot="progressThumb"
            :class="ui.progressThumb({ class: props.ui?.progressThumb })"
          />
        </SliderRoot>

        <div data-slot="bar" :class="ui.bar({ class: props.ui?.bar })">
          <div data-slot="leading" :class="ui.leading({ class: props.ui?.leading })">
            <UButton
              :icon="playing ? (props.pauseIcon || appConfig.ui.icons.pause) : (props.playIcon || appConfig.ui.icons.play)"
              :size="props.size"
              color="neutral"
              variant="ghost"
              :aria-label="playing ? t('videoPlayer.pause') : t('videoPlayer.play')"
              data-slot="button"
              :class="ui.button({ class: props.ui?.button })"
              @click="toggle"
            />

            <div data-slot="volume" :class="ui.volume({ class: props.ui?.volume })">
              <UButton
                :icon="muted || volume === 0 ? (props.volumeOffIcon || appConfig.ui.icons.volumeOff) : (props.volumeIcon || appConfig.ui.icons.volume)"
                :size="props.size"
                color="neutral"
                variant="ghost"
                :aria-label="t('videoPlayer.mute')"
                :aria-pressed="muted || volume === 0"
                data-slot="button"
                :class="ui.button({ class: props.ui?.button })"
                @click="toggleMute"
              />
              <SliderRoot
                :model-value="volumeValue"
                :min="0"
                :max="1"
                :step="0.05"
                data-slot="volumeSlider"
                :class="ui.volumeSlider({ class: props.ui?.volumeSlider })"
                @update:model-value="onVolumeUpdate"
              >
                <SliderTrack data-slot="volumeTrack" :class="ui.volumeTrack({ class: props.ui?.volumeTrack })">
                  <SliderRange data-slot="volumeRange" :class="ui.volumeRange({ class: props.ui?.volumeRange })" />
                </SliderTrack>
                <SliderThumb
                  :aria-label="t('videoPlayer.volume')"
                  :aria-valuetext="`${Math.round(volumeValue[0]! * 100)}%`"
                  data-slot="volumeThumb"
                  :class="ui.volumeThumb({ class: props.ui?.volumeThumb })"
                />
              </SliderRoot>
            </div>

            <span data-slot="time" :class="ui.time({ class: props.ui?.time })">
              {{ formatMediaTime(currentTime) }}<template v-if="duration"> / {{ formatMediaTime(duration) }}</template>
            </span>

            <slot name="leading" v-bind="state" />
          </div>

          <div data-slot="trailing" :class="ui.trailing({ class: props.ui?.trailing })">
            <slot name="trailing" v-bind="state" />

            <UButton
              v-if="captionTracks.length"
              :icon="props.captionsIcon || appConfig.ui.icons.captions"
              :size="props.size"
              color="neutral"
              variant="ghost"
              :aria-label="t('videoPlayer.captions')"
              :aria-pressed="activeTrack >= 0"
              data-slot="button"
              :class="ui.button({ class: props.ui?.button })"
              @click="toggleCaptions"
            />

            <UDropdownMenu
              v-if="settingsItems.length"
              :items="settingsItems"
              :portal="isFullscreen && rootEl ? rootEl : true"
              :content="{ side: 'top', align: 'end' }"
              :size="props.size"
              @update:open="menuOpen = $event"
            >
              <UButton
                :icon="props.settingsIcon || appConfig.ui.icons.settings"
                :size="props.size"
                color="neutral"
                variant="ghost"
                :aria-label="t('videoPlayer.settings')"
                data-slot="button"
                :class="ui.button({ class: props.ui?.button })"
              />
            </UDropdownMenu>

            <UButton
              v-if="props.pictureInPicture && canPictureInPicture"
              :icon="props.pictureInPictureIcon || appConfig.ui.icons.pictureInPicture"
              :size="props.size"
              color="neutral"
              variant="ghost"
              :aria-label="t('videoPlayer.pictureInPicture')"
              :aria-pressed="isPictureInPicture"
              data-slot="button"
              :class="ui.button({ class: props.ui?.button })"
              @click="togglePictureInPicture"
            />

            <UButton
              v-if="props.fullscreen && canFullscreen"
              :icon="isFullscreen ? (props.fullscreenExitIcon || appConfig.ui.icons.fullscreenExit) : (props.fullscreenIcon || appConfig.ui.icons.fullscreen)"
              :size="props.size"
              color="neutral"
              variant="ghost"
              :aria-label="t('videoPlayer.fullscreen')"
              :aria-pressed="isFullscreen"
              data-slot="button"
              :class="ui.button({ class: props.ui?.button })"
              @click="toggleFullscreen"
            />
          </div>
        </div>
      </slot>
    </div>
  </Primitive>
</template>
