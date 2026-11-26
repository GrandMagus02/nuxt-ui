import { describe, it, expect } from 'vitest'
import { fillSeries, findIndexAt, getOffsets, getVisibleRange, isInRange, moveItem, parseTSV, toRange, toTSV } from '../../src/runtime/utils/spreadsheet'

describe('spreadsheet utils', () => {
  it('normalizes a selection to a range', () => {
    expect(toRange({ anchor: { row: 4, column: 1 }, focus: { row: 2, column: 3 } })).toEqual({ top: 2, bottom: 4, start: 1, end: 3 })
  })

  it('checks whether a cell is in a range', () => {
    const range = { top: 1, bottom: 2, start: 1, end: 2 }
    expect(isInRange(range, 1, 1)).toBe(true)
    expect(isInRange(range, 3, 1)).toBe(false)
    expect(isInRange(undefined, 0, 0)).toBe(false)
  })

  it('serializes tab-separated values, quoting special characters', () => {
    expect(toTSV([['a', 'b'], ['c\td', 'say "hi"'], ['line\nbreak', '']])).toBe('a\tb\n"c\td"\t"say ""hi"""\n"line\nbreak"\t')
  })

  it('parses tab-separated values', () => {
    expect(parseTSV('a\tb\r\nc\td\r\n')).toEqual([['a', 'b'], ['c', 'd']])
    expect(parseTSV('"c\td"\t"say ""hi"""\n"line\nbreak"\t')).toEqual([['c\td', 'say "hi"'], ['line\nbreak', '']])
    expect(parseTSV('single')).toEqual([['single']])
    expect(parseTSV('')).toEqual([])
  })

  it('round trips tab-separated values', () => {
    const rows = [['1', 'two words', 'tab\there'], ['"quoted"', '', 'new\nline']]
    expect(parseTSV(toTSV(rows))).toEqual(rows)
  })

  it('continues numeric progressions', () => {
    expect(fillSeries([1, 2], 3)).toEqual([3, 4, 5])
    expect(fillSeries([10, 8], 2)).toEqual([6, 4])
  })

  it('repeats non numeric or irregular patterns', () => {
    expect(fillSeries([5], 3)).toEqual([5, 5, 5])
    expect(fillSeries(['a', 'b'], 3)).toEqual(['a', 'b', 'a'])
    expect(fillSeries([1, 2, 4], 2)).toEqual([1, 2])
    expect(fillSeries([], 2)).toEqual([])
  })

  it('computes offsets and finds the item at a position', () => {
    const offsets = getOffsets([100, 50, 200])
    expect(offsets).toEqual([0, 100, 150, 350])
    expect(findIndexAt(offsets, 0)).toBe(0)
    expect(findIndexAt(offsets, 99)).toBe(0)
    expect(findIndexAt(offsets, 100)).toBe(1)
    expect(findIndexAt(offsets, 349)).toBe(2)
    expect(findIndexAt(offsets, 1000)).toBe(2)
    expect(findIndexAt([0], 10)).toBe(-1)
  })

  it('computes the visible range with overscan', () => {
    const offsets = getOffsets(Array.from({ length: 100 }, () => 10))
    expect(getVisibleRange(offsets, 0, 50, 0)).toEqual([0, 4])
    expect(getVisibleRange(offsets, 255, 50, 2)).toEqual([23, 32])
    expect(getVisibleRange(offsets, 980, 50, 3)).toEqual([95, 99])
    expect(getVisibleRange([0], 0, 50, 3)).toEqual([0, -1])
  })

  it('moves an item', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c'])
  })
})
