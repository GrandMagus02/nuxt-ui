<script lang="ts">
import type { VNode } from 'vue'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/chat-audio'
import type { IconProps } from './Icon.vue'
import type { ComponentConfig } from '../types/tv'

type ChatAudio = ComponentConfig<typeof theme, AppConfig, 'chatAudio'>

export interface ChatAudioProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  /**
   * The URL of the audio to play.
   */
  src?: string
  /**
   * The audio to play, such as a recorded voice message. Played and decoded through an object URL.
   */
  file?: Blob
  /**
   * The amplitudes of the waveform, between `0` and `1`. Resampled to `bars`.
   * When omitted, they are computed by decoding the audio, which downloads it entirely.
   */
  peaks?: number[]
  /**
   * The duration of the audio in seconds, displayed until the audio metadata loads.
   */
  duration?: number
  /**
   * The number of bars of the waveform.
   * @defaultValue 32
   */
  bars?: number
  /**
   * The number of seconds the arrow keys seek by.
   * @defaultValue 5
   */
  step?: number
  /**
   * Inside a [ChatMessage](/docs/components/chat-message), defaults to the color of the message.
   * @defaultValue 'neutral'
   */
  color?: ChatAudio['variants']['color']
  /**
   * Inside a [ChatMessage](/docs/components/chat-message), defaults to the variant of the message.
   * @defaultValue 'soft'
   */
  variant?: ChatAudio['variants']['variant']
  /**
   * Inside a compact [ChatMessage](/docs/components/chat-message), defaults to `sm`.
   * @defaultValue 'md'
   */
  size?: ChatAudio['variants']['size']
  disabled?: boolean
  /**
   * Display a button to remove the audio.
   * @defaultValue false
   */
  removable?: boolean
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
   * The icon of the remove button.
   * @defaultValue appConfig.ui.icons.close
   * @IconifyIcon
   */
  removeIcon?: IconProps['name']
  class?: any
  ui?: ChatAudio['slots']
}

export interface ChatAudioEmits {
  play: [event: Event]
  pause: [event: Event]
  ended: [event: Event]
  error: [event: Event]
  remove: [event: MouseEvent]
}

export interface ChatAudioSlots {
  time?(props: { currentTime: number, duration: number, playing: boolean }): VNode[]
}

// Only one voice message plays at a time
let activeAudio: HTMLAudioElement | undefined
</script>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, shallowRef, useTemplateRef, watch, watchEffect } from 'vue'
import { Primitive } from 'reka-ui'
import { useRafFn } from '@vueuse/core'
import { useAppConfig } from '#imports'
import { useComponentProps } from '../composables/useComponentProps'
import { useLocale } from '../composables/useLocale'
import { decodeAudioPeaks, formatAudioTime, resamplePeaks } from '../utils/audio'
import { chatMessageInjectionKey } from '../utils/chat'
import { tv } from '../utils/tv'
import UIcon from './Icon.vue'
import UButton from './Button.vue'

const _props = withDefaults(defineProps<ChatAudioProps>(), {
  as: 'div',
  bars: 32,
  step: 5
})
const emits = defineEmits<ChatAudioEmits>()
defineSlots<ChatAudioSlots>()

const props = useComponentProps('chatAudio', _props)

const { t } = useLocale()
const appConfig = useAppConfig() as ChatAudio['AppConfig']

// Inside a `UChatMessage`, match its bubble unless set explicitly
const message = inject(chatMessageInjectionKey, undefined)

const audioRef = useTemplateRef<HTMLAudioElement>('audioRef')
const waveformRef = useTemplateRef<HTMLElement>('waveformRef')

// A `Blob` has no URL, play it through an object URL released when the file changes
const fileUrl = ref<string>()
watchEffect((onCleanup) => {
  if (props.src || !props.file) {
    fileUrl.value = undefined
    return
  }

  const url = URL.createObjectURL(props.file)
  fileUrl.value = url
  onCleanup(() => URL.revokeObjectURL(url))
})

const audioSrc = computed(() => props.src ?? fileUrl.value)

const playing = ref(false)
const currentTime = ref(0)
const mediaDuration = ref<number>()
const decoded = shallowRef<{ duration: number, peaks: number[] }>()

// The decoded duration is exact, the media element estimates it from the bitrate of a VBR file until it has read it all
const totalDuration = computed(() => {
  if (decoded.value?.duration) return decoded.value.duration
  if (mediaDuration.value !== undefined && Number.isFinite(mediaDuration.value)) return mediaDuration.value
  return props.duration ?? 0
})

const progress = computed(() => totalDuration.value > 0 ? Math.min(1, currentTime.value / totalDuration.value) : 0)

const waveform = computed(() => {
  const count = Math.max(1, Math.round(props.bars))
  const peaks = props.peaks ?? decoded.value?.peaks

  return peaks?.length ? resamplePeaks(peaks, count) : Array.from({ length: count }, () => 0)
})

// Compute the peaks from the audio itself when none are given
watch([audioSrc, () => props.peaks === undefined, () => props.bars], ([src, decode], _, onCleanup) => {
  decoded.value = undefined
  if (!src || !decode || typeof window === 'undefined') return

  const controller = new AbortController()
  onCleanup(() => controller.abort())

  decodeAudioPeaks(props.file && !props.src ? props.file : src, Math.max(64, Math.round(props.bars) * 4), controller.signal)
    .then((result) => {
      if (!controller.signal.aborted) decoded.value = result
    })
    .catch(() => {})
}, { immediate: true })

// `timeupdate` only fires a few times a second, follow the playhead every frame while playing
const { pause: stopTracking, resume: startTracking } = useRafFn(() => {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}, { immediate: false })

function onPlay(event: Event) {
  const el = event.target as HTMLAudioElement
  if (activeAudio && activeAudio !== el) {
    activeAudio.pause()
  }
  activeAudio = el

  playing.value = true
  startTracking()
  emits('play', event)
}

function onPause(event: Event) {
  playing.value = false
  stopTracking()
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
  emits('pause', event)
}

function onEnded(event: Event) {
  playing.value = false
  stopTracking()
  currentTime.value = 0
  if (audioRef.value) audioRef.value.currentTime = 0
  emits('ended', event)
}

// Recordings from `MediaRecorder` report an `Infinity` duration until the browser has seen their end
let probingDuration = false
function onLoadedMetadata() {
  const el = audioRef.value
  if (!el) return

  if (el.duration === Infinity) {
    probingDuration = true
    el.currentTime = Number.MAX_SAFE_INTEGER
    return
  }
  mediaDuration.value = el.duration
}

function onDurationChange() {
  const el = audioRef.value
  if (!el || !Number.isFinite(el.duration)) return

  mediaDuration.value = el.duration
  if (probingDuration) {
    probingDuration = false
    el.currentTime = 0
  }
}

function onTimeUpdate() {
  if (!probingDuration && audioRef.value && !playing.value) currentTime.value = audioRef.value.currentTime
}

function toggle() {
  const el = audioRef.value
  if (!el || props.disabled) return

  if (el.paused) {
    el.play().catch(() => {})
  } else {
    el.pause()
  }
}

function play() {
  if (!props.disabled) audioRef.value?.play().catch(() => {})
}

function pause() {
  audioRef.value?.pause()
}

function seek(time: number) {
  const el = audioRef.value
  if (!el || props.disabled || !totalDuration.value) return

  const value = Math.min(Math.max(0, time), totalDuration.value)
  el.currentTime = value
  currentTime.value = value
}

function isRTL() {
  return !!waveformRef.value && getComputedStyle(waveformRef.value).direction === 'rtl'
}

function seekToPointer(event: PointerEvent) {
  const el = waveformRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  let ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0
  if (isRTL()) ratio = 1 - ratio

  seek(Math.min(1, Math.max(0, ratio)) * totalDuration.value)
}

let dragging = false

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return

  dragging = true
  waveformRef.value?.setPointerCapture?.(event.pointerId)
  seekToPointer(event)
}

function onPointerMove(event: PointerEvent) {
  if (dragging) seekToPointer(event)
}

function onPointerUp(event: PointerEvent) {
  dragging = false
  waveformRef.value?.releasePointerCapture?.(event.pointerId)
}

function onKeydown(event: KeyboardEvent) {
  const forward = isRTL() ? 'ArrowLeft' : 'ArrowRight'
  const backward = isRTL() ? 'ArrowRight' : 'ArrowLeft'

  switch (event.key) {
    case forward:
    case 'ArrowUp':
      seek(currentTime.value + props.step)
      break
    case backward:
    case 'ArrowDown':
      seek(currentTime.value - props.step)
      break
    case 'Home':
      seek(0)
      break
    case 'End':
      seek(totalDuration.value)
      break
    case ' ':
    case 'Enter':
      toggle()
      break
    default:
      return
  }
  event.preventDefault()
}

onBeforeUnmount(() => {
  if (activeAudio === audioRef.value) activeAudio = undefined
  audioRef.value?.pause()
})

const displayTime = computed(() => playing.value || currentTime.value > 0 ? currentTime.value : totalDuration.value)
const valueText = computed(() => `${formatAudioTime(currentTime.value)} / ${formatAudioTime(totalDuration.value)}`)

const ui = computed(() => tv({ extend: theme, ...(appConfig.ui?.chatAudio || {}) })({
  color: (_props.color ?? message?.value.color ?? props.color) as ChatAudio['variants']['color'],
  variant: (_props.variant ?? message?.value.variant ?? props.variant) as ChatAudio['variants']['variant'],
  size: _props.size ?? (message?.value.compact ? 'sm' : props.size)
}))

defineExpose({
  audioRef,
  play,
  pause,
  toggle,
  seek
})
</script>

<template>
  <Primitive
    :as="props.as"
    :data-state="playing ? 'playing' : 'paused'"
    :data-disabled="props.disabled ? '' : undefined"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <audio
      ref="audioRef"
      :src="audioSrc"
      preload="metadata"
      hidden
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="emits('error', $event)"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="onDurationChange"
      @timeupdate="onTimeUpdate"
    />

    <button
      type="button"
      :disabled="props.disabled || !audioSrc"
      :aria-label="playing ? t('chatAudio.pause') : t('chatAudio.play')"
      data-slot="play"
      :class="ui.play({ class: props.ui?.play })"
      @click="toggle"
    >
      <UIcon
        :name="playing ? (props.pauseIcon || appConfig.ui.icons.pause) : (props.playIcon || appConfig.ui.icons.play)"
        data-slot="playIcon"
        :class="ui.playIcon({ class: props.ui?.playIcon })"
      />
    </button>

    <div
      ref="waveformRef"
      role="slider"
      :tabindex="props.disabled ? -1 : 0"
      :aria-label="t('chatAudio.seek')"
      aria-valuemin="0"
      :aria-valuemax="Math.round(totalDuration)"
      :aria-valuenow="Math.round(currentTime)"
      :aria-valuetext="valueText"
      :aria-disabled="props.disabled ? 'true' : undefined"
      :data-disabled="props.disabled ? '' : undefined"
      data-slot="waveform"
      :class="ui.waveform({ class: props.ui?.waveform })"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    >
      <span
        v-for="(peak, index) in waveform"
        :key="index"
        :data-played="index / waveform.length < progress"
        data-slot="bar"
        :class="ui.bar({ class: props.ui?.bar })"
        :style="{ height: `${Math.max(0, Math.min(1, peak)) * 100}%` }"
      />
    </div>

    <span data-slot="time" :class="ui.time({ class: props.ui?.time })">
      <slot name="time" :current-time="currentTime" :duration="totalDuration" :playing="playing">
        {{ formatAudioTime(displayTime) }}
      </slot>
    </span>

    <UButton
      v-if="props.removable"
      :icon="props.removeIcon || appConfig.ui.icons.close"
      color="neutral"
      variant="link"
      size="xs"
      :aria-label="t('chatAudio.remove')"
      data-slot="remove"
      :class="ui.remove({ class: props.ui?.remove })"
      @click="emits('remove', $event)"
    />
  </Primitive>
</template>
