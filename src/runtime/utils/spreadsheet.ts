export interface SpreadsheetCellPosition {
  /** The index of the row in `data`. */
  row: number
  /** The index of the column in display order. */
  column: number
}

export interface SpreadsheetSelection {
  /** The active cell, where the selection started. It holds the focus and is edited on `Enter`. */
  anchor: SpreadsheetCellPosition
  /** The opposite corner of the selected range. Equal to `anchor` for a single cell. */
  focus: SpreadsheetCellPosition
}

export interface SpreadsheetRange {
  top: number
  bottom: number
  start: number
  end: number
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function toRange(selection: SpreadsheetSelection): SpreadsheetRange {
  const { anchor, focus } = selection
  return {
    top: Math.min(anchor.row, focus.row),
    bottom: Math.max(anchor.row, focus.row),
    start: Math.min(anchor.column, focus.column),
    end: Math.max(anchor.column, focus.column)
  }
}

export function isInRange(range: SpreadsheetRange | undefined, row: number, column: number) {
  return !!range && row >= range.top && row <= range.bottom && column >= range.start && column <= range.end
}

/** Serializes a block of values as tab-separated text, the format spreadsheets exchange through the clipboard. */
export function toTSV(rows: string[][]): string {
  return rows.map(row => row.map((value) => {
    if (/[\t\n\r"]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }).join('\t')).join('\n')
}

/** Parses tab-separated text as copied from a spreadsheet, honoring quoted values that hold tabs or line breaks. */
export function parseTSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false
  let i = 0

  const input = text.replace(/\r\n?/g, '\n')

  while (i < input.length) {
    const char = input[i]!

    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          value += '"'
          i += 2
          continue
        }
        quoted = false
      } else {
        value += char
      }
    } else if (char === '"' && value === '') {
      quoted = true
    } else if (char === '\t') {
      row.push(value)
      value = ''
    } else if (char === '\n') {
      row.push(value)
      rows.push(row)
      row = []
      value = ''
    } else {
      value += char
    }
    i++
  }

  // A trailing line break ends the last row instead of starting an empty one.
  if (value !== '' || row.length) {
    row.push(value)
    rows.push(row)
  }

  return rows
}

/**
 * Extends `source` by `count` values. Numbers in an arithmetic progression of at least two values continue the
 * series; anything else repeats the source pattern.
 */
export function fillSeries(source: any[], count: number): any[] {
  if (!source.length || count <= 0) {
    return []
  }

  const numeric = source.length > 1 && source.every(value => typeof value === 'number' && Number.isFinite(value))
  if (numeric) {
    const step = source[1] - source[0]
    const progression = source.every((value, index) => index === 0 || Math.abs(value - source[index - 1] - step) < 1e-9)
    if (progression) {
      const last = source[source.length - 1]
      return Array.from({ length: count }, (_, index) => last + step * (index + 1))
    }
  }

  return Array.from({ length: count }, (_, index) => source[index % source.length])
}

/** Returns the cumulative start offset of each item, with the total size as the last entry. */
export function getOffsets(sizes: number[]): number[] {
  const offsets = Array.from({ length: sizes.length + 1 }, () => 0)
  for (let i = 0; i < sizes.length; i++) {
    offsets[i + 1] = offsets[i]! + sizes[i]!
  }
  return offsets
}

/** Finds the index of the item under `position` in an `offsets` array built by `getOffsets`. */
export function findIndexAt(offsets: number[], position: number): number {
  const count = offsets.length - 1
  if (count <= 0) {
    return -1
  }

  let low = 0
  let high = count - 1
  while (low < high) {
    const mid = (low + high + 1) >> 1
    if (offsets[mid]! <= position) {
      low = mid
    } else {
      high = mid - 1
    }
  }
  return low
}

/** Returns the inclusive `[first, last]` indexes of the items intersecting `[start, start + size]`, widened by `overscan`. */
export function getVisibleRange(offsets: number[], start: number, size: number, overscan: number): [number, number] {
  const count = offsets.length - 1
  if (count <= 0) {
    return [0, -1]
  }

  const first = findIndexAt(offsets, Math.max(0, start))
  const last = findIndexAt(offsets, Math.max(0, start + size - 1))
  return [Math.max(0, first - overscan), Math.min(count - 1, last + overscan)]
}

/** Moves the item at `from` so that it lands at index `to` of the resulting array. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const result = items.slice()
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item as T)
  return result
}
