import { describe, it, expect } from 'vitest'
import { formatAudioTime, resamplePeaks, getAudioExtension } from '../../src/runtime/utils/audio'

describe('formatAudioTime', () => {
  it.each([
    [undefined, '0:00'],
    [Number.NaN, '0:00'],
    [Infinity, '0:00'],
    [-1, '0:00'],
    [0, '0:00'],
    [5.9, '0:05'],
    [75, '1:15'],
    [3661, '1:01:01']
  ])('formats %s as %s', (seconds, expected) => {
    expect(formatAudioTime(seconds)).toBe(expected)
  })
})

describe('resamplePeaks', () => {
  it('keeps the max of each bucket, normalized to the loudest', () => {
    expect(resamplePeaks([0.1, 0.2, 0.4, 0.1], 2)).toEqual([0.5, 1])
  })

  it('stretches fewer peaks than bars', () => {
    expect(resamplePeaks([0.5, 1], 4)).toEqual([0.5, 0.5, 1, 1])
  })

  it('returns flat bars without peaks', () => {
    expect(resamplePeaks([], 3)).toEqual([0, 0, 0])
    expect(resamplePeaks([0, 0], 2)).toEqual([0, 0])
  })
})

describe('getAudioExtension', () => {
  it.each([
    ['audio/webm;codecs=opus', 'webm'],
    ['audio/ogg', 'ogg'],
    ['audio/mp4', 'm4a'],
    ['audio/mpeg', 'mp3'],
    [undefined, 'webm']
  ])('maps %s to %s', (type, extension) => {
    expect(getAudioExtension(type)).toBe(extension)
  })
})
