/**
 * Formats a duration in seconds as `m:ss`, or `h:mm:ss` past an hour.
 */
export function formatMediaTime(seconds?: number): string {
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
 * Returns the end, in seconds, of the buffered range that contains `time`, or `time` itself when it isn't buffered.
 */
export function getBufferedEnd(buffered: TimeRanges | undefined, time: number): number {
  if (!buffered) {
    return time
  }

  for (let i = 0; i < buffered.length; i++) {
    if (buffered.start(i) <= time && time <= buffered.end(i)) {
      return buffered.end(i)
    }
  }

  return time
}
