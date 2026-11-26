<script lang="ts">
import type { VNode } from 'vue'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/chat-audio-recorder'
import type { ButtonProps } from './Button.vue'
import type { IconProps } from './Icon.vue'
import type { LinkPropsKeys } from './Link.vue'
import type { ComponentConfig } from '../types/tv'

type ChatAudioRecorder = ComponentConfig<typeof theme, AppConfig, 'chatAudioRecorder'>

export interface ChatAudioRecorderRecord {
  /**
   * The length of the recording in seconds.
   */
  duration: number
  /**
   * The amplitudes of the recording between `0` and `1`, to pass to the `peaks` prop of [ChatAudio](/docs/components/chat-audio).
   */
  peaks: number[]
}

export interface ChatAudioRecorderProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  /**
   * The color of the record button.
   * @defaultValue 'neutral'
   */
  color?: ButtonProps['color']
  /**
   * The variant of the record button.
   * @defaultValue 'ghost'
   */
  variant?: ButtonProps['variant']
  /**
   * @defaultValue 'md'
   */
  size?: ChatAudioRecorder['variants']['size']
  /**
   * Stop the recording automatically after this many seconds.
   */
  maxDuration?: number
  /**
   * The preferred media type of the recording, the first one the browser supports is used otherwise.
   * @defaultValue 'audio/webm;codecs=opus'
   */
  mimeType?: string
  /**
   * The bitrate of the recording.
   */
  audioBitsPerSecond?: number
  /**
   * The number of bars of the live waveform.
   * @defaultValue 32
   */
  bars?: number
  /**
   * The name of the recorded file, without extension.
   * @defaultValue 'voice-message'
   */
  name?: string
  disabled?: boolean
  /**
   * The icon of the record button.
   * @defaultValue appConfig.ui.icons.microphone
   * @IconifyIcon
   */
  icon?: IconProps['name']
  /**
   * The icon of the button that stops and keeps the recording.
   * @defaultValue appConfig.ui.icons.stop
   * @IconifyIcon
   */
  stopIcon?: IconProps['name']
  /**
   * The icon of the button that discards the recording.
   * @defaultValue appConfig.ui.icons.trash
   * @IconifyIcon
   */
  cancelIcon?: IconProps['name']
  /**
   * Customize the button that stops and keeps the recording.
   * `{ color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   */
  stop?: Omit<ButtonProps, LinkPropsKeys>
  /**
   * Customize the button that discards the recording.
   * `{ color: 'neutral', variant: 'ghost' }`{lang="ts-type"}
   */
  cancel?: Omit<ButtonProps, LinkPropsKeys>
  class?: any
  ui?: ChatAudioRecorder['slots']
}

export interface ChatAudioRecorderEmits {
  start: []
  /**
   * Emitted with the recorded file when the recording is stopped.
   */
  record: [file: File, record: ChatAudioRecorderRecord]
  cancel: []
  /**
   * Emitted when the microphone is unavailable, its access is denied or the recording fails.
   */
  error: [error: Error]
}

export interface ChatAudioRecorderSlots {
  /**
   * Replace the record button.
   */
  default?(props: { start: () => Promise<void>, disabled: boolean }): VNode[]
}
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { Primitive, VisuallyHidden } from 'reka-ui'
import { useRafFn } from '@vueuse/core'
import { useAppConfig } from '#imports'
import { useComponentProps } from '../composables/useComponentProps'
import { useLocale } from '../composables/useLocale'
import { formatAudioTime, getAudioExtension, getSupportedAudioMimeType, resamplePeaks } from '../utils/audio'
import { tv } from '../utils/tv'
import UButton from './Button.vue'

const _props = withDefaults(defineProps<ChatAudioRecorderProps>(), {
  as: 'div',
  color: 'neutral',
  variant: 'ghost',
  bars: 32,
  name: 'voice-message'
})
const emits = defineEmits<ChatAudioRecorderEmits>()
defineSlots<ChatAudioRecorderSlots>()

const props = useComponentProps('chatAudioRecorder', _props)

const { t } = useLocale()
const appConfig = useAppConfig() as ChatAudioRecorder['AppConfig']

const triggerRef = useTemplateRef('triggerRef')
const stopRef = useTemplateRef('stopRef')

const recording = ref(false)
const starting = ref(false)
const elapsed = ref(0)
const levels = ref<number[]>([])

let stream: MediaStream | undefined
let recorder: MediaRecorder | undefined
let context: AudioContext | undefined
let analyser: AnalyserNode | undefined
let samples: Float32Array<ArrayBuffer> | undefined
let chunks: Blob[] = []
let peaks: number[] = []
let startedAt = 0
let lastSampleAt = 0
let discard = false

const SAMPLE_INTERVAL = 100

const barCount = computed(() => Math.max(1, Math.round(props.bars)))

// New levels come in from the end, the waveform scrolls towards the start
const waveform = computed(() => {
  const visible = levels.value.slice(-barCount.value)
  return [...Array.from({ length: barCount.value - visible.length }, () => 0), ...visible]
})

function sampleLevel() {
  if (!analyser || !samples) return 0

  analyser.getFloatTimeDomainData(samples)
  let sum = 0
  for (let i = 0; i < samples.length; i++) sum += samples[i]! * samples[i]!

  // Speech sits low on a linear scale, the square root and a gain spread it over the bar height
  return Math.min(1, Math.sqrt(Math.sqrt(sum / samples.length)) * 1.6)
}

const { pause: stopTicking, resume: startTicking } = useRafFn(({ timestamp }) => {
  elapsed.value = (performance.now() - startedAt) / 1000

  if (timestamp - lastSampleAt >= SAMPLE_INTERVAL) {
    lastSampleAt = timestamp
    const level = sampleLevel()
    peaks.push(level)
    levels.value = [...levels.value.slice(-(barCount.value - 1)), level]
  }

  if (props.maxDuration && elapsed.value >= props.maxDuration) {
    stopRecording()
  }
}, { immediate: false })

function release() {
  stopTicking()
  stream?.getTracks().forEach(track => track.stop())
  context?.close().catch(() => {})
  stream = undefined
  recorder = undefined
  context = undefined
  analyser = undefined
  samples = undefined
  recording.value = false
  levels.value = []
}

async function start() {
  if (props.disabled || recording.value || starting.value) return

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    emits('error', new Error('Audio recording is not supported in this browser'))
    return
  }

  starting.value = true
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (error) {
    starting.value = false
    emits('error', error instanceof Error ? error : new Error(String(error)))
    return
  }

  try {
    const mimeType = getSupportedAudioMimeType(props.mimeType)
    recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: props.audioBitsPerSecond })

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    context = new AudioContextClass() as AudioContext
    analyser = context.createAnalyser()
    analyser.fftSize = 1024
    samples = new Float32Array(analyser.fftSize)
    context.createMediaStreamSource(stream).connect(analyser)

    chunks = []
    peaks = []
    discard = false

    const current = recorder
    current.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data)
    }
    current.onstop = () => finish(current.mimeType || mimeType)
    current.onerror = (event: Event) => {
      release()
      emits('error', (event as any).error ?? new Error('Recording failed'))
    }

    current.start(250)
    startedAt = performance.now()
    lastSampleAt = 0
    elapsed.value = 0
    recording.value = true
    startTicking()
    emits('start')

    await nextTick()
    stopRef.value?.$el?.focus?.()
  } catch (error) {
    release()
    emits('error', error instanceof Error ? error : new Error(String(error)))
  } finally {
    starting.value = false
  }
}

function finish(mimeType?: string) {
  const duration = (performance.now() - startedAt) / 1000
  const recordedPeaks = peaks
  const recordedChunks = chunks
  const discarded = discard

  release()
  chunks = []
  peaks = []

  if (discarded) {
    emits('cancel')
  } else if (recordedChunks.length) {
    const type = mimeType?.split(';')[0] || 'audio/webm'
    const file = new File(recordedChunks, `${props.name}-${Date.now()}.${getAudioExtension(type)}`, { type })

    emits('record', file, { duration, peaks: resamplePeaks(recordedPeaks, 64) })
  }

  nextTick(() => triggerRef.value?.$el?.focus?.())
}

function stopRecording() {
  if (!recorder || recorder.state === 'inactive') return

  discard = false
  stopTicking()
  recorder.stop()
}

function cancelRecording() {
  if (!recorder || recorder.state === 'inactive') return

  discard = true
  stopTicking()
  recorder.stop()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && recording.value) {
    event.preventDefault()
    event.stopPropagation()
    cancelRecording()
  }
}

onBeforeUnmount(() => {
  if (recorder && recorder.state !== 'inactive') {
    recorder.onstop = null
    recorder.stop()
  }
  release()
})

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() => tv({ extend: theme, ...(appConfig.ui?.chatAudioRecorder || {}) })({
  size: props.size,
  recording: recording.value
}))

defineExpose({
  start,
  stop: stopRecording,
  cancel: cancelRecording,
  recording
})
</script>

<template>
  <Primitive
    :as="props.as"
    :data-state="recording ? 'recording' : 'idle'"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    @keydown="onKeydown"
  >
    <template v-if="recording">
      <UButton
        :icon="props.cancelIcon || appConfig.ui.icons.trash"
        color="neutral"
        variant="ghost"
        :size="props.size"
        :aria-label="t('chatAudioRecorder.cancel')"
        v-bind="props.cancel"
        data-slot="cancel"
        :class="ui.cancel({ class: [props.ui?.cancel, props.cancel?.class] })"
        @click="cancelRecording"
      />

      <span data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })" />

      <span data-slot="time" :class="ui.time({ class: props.ui?.time })">{{ formatAudioTime(elapsed) }}</span>

      <div aria-hidden="true" data-slot="waveform" :class="ui.waveform({ class: props.ui?.waveform })">
        <span
          v-for="(level, index) in waveform"
          :key="index"
          data-slot="bar"
          :class="ui.bar({ class: props.ui?.bar })"
          :style="{ height: `${level * 100}%` }"
        />
      </div>

      <UButton
        ref="stopRef"
        :icon="props.stopIcon || appConfig.ui.icons.stop"
        color="neutral"
        variant="ghost"
        :size="props.size"
        :aria-label="t('chatAudioRecorder.stop')"
        v-bind="props.stop"
        data-slot="stop"
        :class="ui.stop({ class: [props.ui?.stop, props.stop?.class] })"
        @click="stopRecording"
      />
    </template>

    <template v-else>
      <slot :start="start" :disabled="!!props.disabled">
        <UButton
          ref="triggerRef"
          :icon="props.icon || appConfig.ui.icons.microphone"
          :color="props.color"
          :variant="props.variant"
          :size="props.size"
          :loading="starting"
          :disabled="props.disabled"
          :aria-label="t('chatAudioRecorder.record')"
          data-slot="trigger"
          :class="ui.trigger({ class: props.ui?.trigger })"
          @click="start"
        />
      </slot>
    </template>

    <VisuallyHidden aria-live="polite">
      {{ recording ? t('chatAudioRecorder.recording') : '' }}
    </VisuallyHidden>
  </Primitive>
</template>
