/**
 * Formats a duration in seconds as `m:ss`, or `h:mm:ss` past an hour.
 */
export function formatAudioTime(seconds?: number): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  const ss = String(s).padStart(2, '0')

  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/**
 * Resamples peaks to `count` bars by taking the max of each bucket, normalized so the loudest bar is `1`.
 */
export function resamplePeaks(peaks: number[], count: number): number[] {
  if (count <= 0) {
    return []
  }
  if (!peaks.length) {
    return Array.from({ length: count }, () => 0)
  }

  const result: number[] = []
  const step = peaks.length / count

  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * step)
    const end = Math.max(start + 1, Math.floor((i + 1) * step))

    let max = 0
    for (let j = start; j < end && j < peaks.length; j++) {
      const value = Math.abs(peaks[j]!)
      if (value > max) max = value
    }
    result.push(max)
  }

  const highest = Math.max(...result)

  return highest > 0 ? result.map(value => value / highest) : result
}

/**
 * Computes `count` peaks from an `AudioBuffer`, as the RMS of each bucket across all channels.
 */
export function getAudioBufferPeaks(buffer: AudioBuffer, count: number): number[] {
  const length = buffer.length
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i))
  const step = Math.max(1, Math.floor(length / count))

  const peaks: number[] = []
  for (let i = 0; i < count; i++) {
    const start = i * step
    const end = Math.min(start + step, length)

    let sum = 0
    let n = 0
    for (const data of channels) {
      for (let j = start; j < end; j++) {
        sum += data[j]! * data[j]!
        n++
      }
    }
    peaks.push(n ? Math.sqrt(sum / n) : 0)
  }

  return resamplePeaks(peaks, count)
}

async function fetchAudio(url: string, signal?: AbortSignal, cache?: RequestCache): Promise<ArrayBuffer> {
  const response = await fetch(url, { signal, cache })
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`)

  const data = await response.arrayBuffer()

  // The HTTP cache can hand a body the `<audio>` element is still downloading the same file into, cut short
  const length = Number(response.headers.get('content-length'))
  if (!cache && length && data.byteLength < length) {
    return fetchAudio(url, signal, 'no-store')
  }

  return data
}

/**
 * Decodes an audio source (a `Blob` or a URL) and returns its duration and `count` peaks.
 * Rejects when the source can't be fetched (e.g. CORS) or decoded.
 */
export async function decodeAudioPeaks(source: Blob | string, count: number, signal?: AbortSignal): Promise<{ duration: number, peaks: number[] }> {
  const data = typeof source === 'string' ? await fetchAudio(source, signal) : await source.arrayBuffer()

  signal?.throwIfAborted()

  // An offline context decodes without opening an audio output device
  const OfflineContextClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext
  const context: BaseAudioContext = OfflineContextClass
    ? new OfflineContextClass(1, 1, 44100)
    : new (window.AudioContext || (window as any).webkitAudioContext)()

  try {
    const buffer = await context.decodeAudioData(data)

    return { duration: buffer.duration, peaks: getAudioBufferPeaks(buffer, count) }
  } finally {
    if ('close' in context) (context as AudioContext).close().catch(() => {})
  }
}

/**
 * Returns the first media type the browser's `MediaRecorder` supports, preferring Opus.
 */
export function getSupportedAudioMimeType(preferred?: string): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined
  }

  const candidates = [preferred, 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/mpeg'].filter(Boolean) as string[]

  return candidates.find(type => MediaRecorder.isTypeSupported?.(type))
}

/**
 * Returns a file extension for an audio media type.
 */
export function getAudioExtension(mimeType?: string): string {
  const type = mimeType?.split(';')[0]?.trim()

  switch (type) {
    case 'audio/ogg': return 'ogg'
    case 'audio/mp4': return 'm4a'
    case 'audio/mpeg': return 'mp3'
    case 'audio/wav': return 'wav'
    default: return 'webm'
  }
}
