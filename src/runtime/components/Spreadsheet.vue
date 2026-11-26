<!-- eslint-disable vue/block-tag-newline -->
<script lang="ts">
import type { ComponentPublicInstance, Directive, VNode } from 'vue'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/spreadsheet'
import type { ContextMenuItem, ContextMenuProps } from './ContextMenu.vue'
import type { IconProps } from './Icon.vue'
import type { ComponentConfig } from '../types/tv'
import type { SpreadsheetCellPosition, SpreadsheetSelection, SpreadsheetRange } from '../utils/spreadsheet'

export type { SpreadsheetCellPosition, SpreadsheetSelection, SpreadsheetRange } from '../utils/spreadsheet'

type Spreadsheet = ComponentConfig<typeof theme, AppConfig, 'spreadsheet'>

export type SpreadsheetData = Record<string, any>

export type SpreadsheetColumnType = 'text' | 'number' | 'checkbox' | 'select'

export interface SpreadsheetSelectOption {
  label: string
  value: any
}

export interface SpreadsheetColumn<T extends SpreadsheetData = SpreadsheetData> {
  /** The key of each row holding the values of this column. */
  key: keyof T & string
  /** The text of the column header. Defaults to the `key`. */
  label?: string
  /**
   * How values are displayed, edited and parsed.
   * @defaultValue 'text'
   */
  type?: SpreadsheetColumnType
  /** The choices offered when editing a `select` column. */
  options?: (string | number | SpreadsheetSelectOption)[]
  /** The initial width of the column in pixels. Defaults to `defaultColumnWidth`. */
  width?: number
  /** The minimum width of the column in pixels when resizing. Defaults to `minColumnWidth`. */
  minWidth?: number
  /** The maximum width of the column in pixels when resizing. */
  maxWidth?: number
  /** The alignment of the values. Defaults to `end` for `number`, `center` for `checkbox` and `start` otherwise. */
  align?: 'start' | 'center' | 'end'
  /**
   * Whether the values of this column can be changed. A function decides for each row. Has no effect when the spreadsheet is not `editable`.
   * @defaultValue true
   */
  editable?: boolean | ((row: T, rowIndex: number) => boolean)
  /**
   * Whether this column can be resized. Has no effect when `resizableColumns` is disabled.
   * @defaultValue true
   */
  resizable?: boolean
  /**
   * Whether this column can be moved. Has no effect when `movableColumns` is disabled.
   * @defaultValue true
   */
  movable?: boolean
  /**
   * Whether the rows can be sorted by this column. Has no effect when `sortable` is disabled.
   * @defaultValue true
   */
  sortable?: boolean
  /** The placeholder of the editor of this column. */
  placeholder?: string
  /** Formats a value for display. Edits and copies still use the raw value. */
  format?: (value: any, row: T) => string
  /** Converts typed or pasted text to a value. Return `undefined` to reject the input. */
  parse?: (input: string, row: T) => any
  /** Classes added to the cells of this column. A function returns them for each row. */
  class?: any | ((row: T, rowIndex: number) => any)
  /** Classes added to the header of this column. */
  headerClass?: any
}

export interface SpreadsheetContextMenuContext<T extends SpreadsheetData = SpreadsheetData> {
  /** The active cell and the selected range. */
  selection: SpreadsheetSelection | null
  /** The selected range, normalized. */
  range: SpreadsheetRange | undefined
  /** The column of the active cell. */
  column: SpreadsheetColumn<T> | undefined
}

export interface SpreadsheetChange<T extends SpreadsheetData = SpreadsheetData> {
  rowIndex: number
  row: T
  key: keyof T & string
  value: any
  oldValue: any
}

export interface SpreadsheetVirtualizeOptions {
  /**
   * Only render the rows in view.
   * @defaultValue true
   */
  rows?: boolean
  /**
   * Only render the columns in view.
   * @defaultValue true
   */
  columns?: boolean
  /**
   * The number of rows and columns rendered beyond each edge of the view.
   * @defaultValue 4
   */
  overscan?: number
  /**
   * The number of rows rendered before the size of the spreadsheet is known, e.g. during server-side rendering.
   * @defaultValue 30
   */
  initialRows?: number
  /**
   * The number of columns rendered before the size of the spreadsheet is known, e.g. during server-side rendering.
   * @defaultValue 12
   */
  initialColumns?: number
}

export interface SpreadsheetProps<T extends SpreadsheetData = SpreadsheetData> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  /** The columns to display. Defaults to the keys of the first row. */
  columns?: SpreadsheetColumn<T>[]
  /** The height of each row in pixels. Defaults to a height matching `size`. */
  rowHeight?: number
  /**
   * The width in pixels of columns without a `width`.
   * @defaultValue 128
   */
  defaultColumnWidth?: number
  /**
   * The minimum width in pixels of columns without a `minWidth`.
   * @defaultValue 48
   */
  minColumnWidth?: number
  /** The width of the row headers in pixels. Defaults to a width that fits the last row number. */
  rowHeaderWidth?: number
  /**
   * @defaultValue 'primary'
   */
  color?: Spreadsheet['variants']['color']
  /**
   * @defaultValue 'md'
   */
  size?: Spreadsheet['variants']['size']
  /**
   * The text to display when there are no rows.
   * @defaultValue t('table.noData')
   */
  empty?: string
  /**
   * Display a loading bar under the column headers.
   * @defaultValue false
   */
  loading?: boolean
  /**
   * @defaultValue 'primary'
   */
  loadingColor?: Spreadsheet['variants']['loadingColor']
  /**
   * @defaultValue 'carousel'
   */
  loadingAnimation?: Spreadsheet['variants']['loadingAnimation']
  /**
   * Allow changing values by typing, pasting, clearing and filling.
   * @defaultValue true
   */
  editable?: boolean
  /**
   * Start editing the active cell when a character is typed, replacing its value.
   * @defaultValue true
   */
  editOnType?: boolean
  /**
   * Where the active cell moves after saving an edit with `Enter`. `Shift` + `Enter` moves the opposite way.
   * @defaultValue 'down'
   */
  enterDirection?: 'down' | 'end' | 'none'
  /**
   * Allow selecting ranges of cells, whole rows and whole columns. When disabled, only the active cell is highlighted.
   * @defaultValue true
   */
  selectable?: boolean
  /**
   * Display the row numbers.
   * @defaultValue true
   */
  rowHeaders?: boolean
  /**
   * Display the column headers.
   * @defaultValue true
   */
  columnHeaders?: boolean
  /**
   * Allow resizing columns by dragging the edge of their header.
   * @defaultValue true
   */
  resizableColumns?: boolean
  /**
   * Allow reordering columns by dragging their header, or with `Alt` + `Shift` + `←` / `→`.
   * @defaultValue true
   */
  movableColumns?: boolean
  /**
   * Allow reordering rows by dragging their header, or with `Alt` + `Shift` + `↑` / `↓`.
   * @defaultValue true
   */
  movableRows?: boolean
  /**
   * Copy, cut and paste ranges as tab-separated text, compatible with other spreadsheet apps.
   * @defaultValue true
   */
  clipboard?: boolean
  /**
   * Display a handle in the corner of the selection to extend its values to adjacent cells.
   * @defaultValue true
   */
  fillHandle?: boolean
  /**
   * Keep a history of changes to undo and redo. A number sets how many changes are kept.
   * @defaultValue true
   */
  history?: boolean | number
  /**
   * Open a menu of actions on right click. An object is passed to the ContextMenu component.
   * @defaultValue true
   */
  contextMenu?: boolean | Omit<ContextMenuProps, 'items'>
  /** Changes the items of the context menu. Receives the default items, grouped. */
  contextMenuItems?: (items: ContextMenuItem[][], context: SpreadsheetContextMenuContext<T>) => ContextMenuItem[][]
  /**
   * Allow sorting the rows by a column from the context menu.
   * @defaultValue true
   */
  sortable?: boolean
  /**
   * Allow inserting rows from the context menu, and appending rows when pasting past the last row.
   * @defaultValue true
   */
  insertRows?: boolean
  /**
   * Allow deleting rows from the context menu.
   * @defaultValue true
   */
  deleteRows?: boolean
  /**
   * Only render the rows and columns in view. The spreadsheet must have a bounded height.
   * @defaultValue true
   */
  virtualize?: boolean | SpreadsheetVirtualizeOptions
  /** Creates the row inserted at `index`. Defaults to a row with an empty value for each column. */
  createRow?: (index: number) => T
  /**
   * The icon displayed in the headers to drag columns and rows.
   * @defaultValue appConfig.ui.icons.drag
   * @IconifyIcon
   */
  dragIcon?: IconProps['name']
  /**
   * The icon displayed in checked `checkbox` cells.
   * @defaultValue appConfig.ui.icons.check
   * @IconifyIcon
   */
  checkedIcon?: IconProps['name']
  /**
   * The icon of the ascending sort item of the context menu.
   * @defaultValue appConfig.ui.icons.arrowDown
   * @IconifyIcon
   */
  sortAscendingIcon?: IconProps['name']
  /**
   * The icon of the descending sort item of the context menu.
   * @defaultValue appConfig.ui.icons.arrowUp
   * @IconifyIcon
   */
  sortDescendingIcon?: IconProps['name']
  class?: any
  ui?: Spreadsheet['slots']
}

export interface SpreadsheetEmits<T extends SpreadsheetData = SpreadsheetData> {
  /** Emitted when values are edited, pasted, cleared or filled. */
  'change': [changes: SpreadsheetChange<T>[]]
  /** Emitted when editing a cell starts. */
  'edit-start': [position: SpreadsheetCellPosition]
  /** Emitted when editing a cell ends, with whether the edit was cancelled. */
  'edit-end': [position: SpreadsheetCellPosition, cancelled: boolean]
  /** Emitted when the rows are sorted by a column. */
  'sort': [key: keyof T & string, direction: 'asc' | 'desc']
  /** Emitted when a row is inserted. */
  'row-insert': [rowIndex: number, row: T]
  /** Emitted when rows are deleted, with the index of the first one. */
  'rows-delete': [rowIndex: number, rows: T[]]
  /** Emitted when a row is moved. */
  'row-move': [from: number, to: number]
  /** Emitted when a column is moved. */
  'column-move': [key: keyof T & string, from: number, to: number]
  /** Emitted when a column is resized. */
  'column-resize': [key: keyof T & string, width: number | undefined]
}

export interface SpreadsheetCellSlotProps<T extends SpreadsheetData = SpreadsheetData> {
  row: T
  rowIndex: number
  column: SpreadsheetColumn<T>
  columnIndex: number
  value: any
  active: boolean
  selected: boolean
}

export interface SpreadsheetEditorSlotProps<T extends SpreadsheetData = SpreadsheetData> extends SpreadsheetCellSlotProps<T> {
  /** The text being edited. */
  draft: any
  /** Updates the text being edited. */
  update: (draft: any) => void
  /** Ends editing and saves the draft, or `value` as is when given. */
  commit: (value?: any) => void
  /** Ends editing without saving. */
  cancel: () => void
}

export interface SpreadsheetHeaderSlotProps<T extends SpreadsheetData = SpreadsheetData> {
  column: SpreadsheetColumn<T>
  columnIndex: number
}

type DynamicSlots<T, K = keyof T> = Record<`${K extends string ? K : never}-cell`, (props: SpreadsheetCellSlotProps<T & SpreadsheetData>) => VNode[]>
  & Record<`${K extends string ? K : never}-editor`, (props: SpreadsheetEditorSlotProps<T & SpreadsheetData>) => VNode[]>
  & Record<`${K extends string ? K : never}-header`, (props: SpreadsheetHeaderSlotProps<T & SpreadsheetData>) => VNode[]>

export type SpreadsheetSlots<T extends SpreadsheetData = SpreadsheetData> = {
  'cell'?(props: SpreadsheetCellSlotProps<T>): VNode[]
  'editor'?(props: SpreadsheetEditorSlotProps<T>): VNode[]
  'header'?(props: SpreadsheetHeaderSlotProps<T>): VNode[]
  'row-header'?(props: { row: T, rowIndex: number }): VNode[]
  'empty'?(props?: {}): VNode[]
  'loading'?(props?: {}): VNode[]
} & Partial<DynamicSlots<T>>

type DndInfo = { type: 'row' | 'column', index: number, drag?: boolean, drop?: boolean }

type Edge = 'before' | 'after'

type PointerDrag = {
  mode: 'cells' | 'rows' | 'columns' | 'fill'
  start: number
  x: number
  y: number
  frame?: number
}
</script>

<script setup lang="ts" generic="T extends SpreadsheetData">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { Primitive } from 'reka-ui'
import { useResizeObserver } from '@vueuse/core'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { useAppConfig } from '#imports'
import { useComponentProps } from '../composables/useComponentProps'
import { useLocale } from '../composables/useLocale'
import { tv } from '../utils/tv'
import { clamp, fillSeries, findIndexAt, getOffsets, getVisibleRange, isInRange, moveItem, parseTSV, toRange, toTSV } from '../utils/spreadsheet'
import UContextMenu from './ContextMenu.vue'
import UIcon from './Icon.vue'

defineOptions({ inheritAttrs: false })

const _props = withDefaults(defineProps<SpreadsheetProps<T>>(), {
  defaultColumnWidth: 128,
  minColumnWidth: 48,
  editable: true,
  editOnType: true,
  enterDirection: 'down',
  selectable: true,
  rowHeaders: true,
  columnHeaders: true,
  resizableColumns: true,
  movableColumns: true,
  movableRows: true,
  clipboard: true,
  fillHandle: true,
  history: true,
  contextMenu: true,
  sortable: true,
  insertRows: true,
  deleteRows: true,
  virtualize: true
})
const emits = defineEmits<SpreadsheetEmits<T>>()
defineSlots<SpreadsheetSlots<T>>()

/** The rows of the spreadsheet. */
const data = defineModel<T[]>('data', { default: () => [] })
/** The active cell and the selected range. */
const selection = defineModel<SpreadsheetSelection | null>('selection', { default: null })
/** The column keys in display order. */
const columnOrder = defineModel<string[]>('columnOrder')
/** The column widths in pixels, by column key. */
const columnWidths = defineModel<Record<string, number>>('columnWidths')

const props = useComponentProps<SpreadsheetProps<T>>('spreadsheet', _props)

const appConfig = useAppConfig() as Spreadsheet['AppConfig']
const { t } = useLocale()

const id = useId()

const ROW_HEIGHTS = { xs: 28, sm: 32, md: 36, lg: 40, xl: 44 } as const

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() => tv({ extend: theme, ...(appConfig.ui?.spreadsheet || {}) })({
  color: props.color,
  size: props.size,
  loading: props.loading,
  loadingColor: props.loadingColor,
  loadingAnimation: props.loadingAnimation
}))

const rootRef = useTemplateRef<ComponentPublicInstance>('rootRef')
const viewport = computed(() => rootRef.value?.$el as HTMLElement | undefined)

// Columns

const resolvedColumns = computed<SpreadsheetColumn<T>[]>(() => {
  if (props.columns?.length) {
    return props.columns
  }
  const first = data.value[0]
  return first ? Object.keys(first).map(key => ({ key } as SpreadsheetColumn<T>)) : []
})

const displayColumns = computed<SpreadsheetColumn<T>[]>(() => {
  const order = columnOrder.value
  if (!order?.length) {
    return resolvedColumns.value
  }
  const byKey = new Map(resolvedColumns.value.map(column => [column.key as string, column]))
  const ordered = order.map(key => byKey.get(key)).filter((column): column is SpreadsheetColumn<T> => !!column)
  return [...ordered, ...resolvedColumns.value.filter(column => !order.includes(column.key))]
})

const rowCount = computed(() => data.value.length)
const columnCount = computed(() => displayColumns.value.length)

function getType(column: SpreadsheetColumn<T>): SpreadsheetColumnType {
  return column.type ?? 'text'
}

function getAlign(column: SpreadsheetColumn<T>) {
  if (column.align) {
    return column.align
  }
  const type = getType(column)
  return type === 'number' ? 'end' : type === 'checkbox' ? 'center' : 'start'
}

function isColumnEditable(column: SpreadsheetColumn<T> | undefined) {
  return !!column && !!props.editable && column.editable !== false
}

/** Whether a cell can be changed, applying the column's `editable` function to its row. */
function isCellEditable(rowIndex: number, column: SpreadsheetColumn<T> | undefined, row: T | undefined = data.value[rowIndex]) {
  if (!isColumnEditable(column)) {
    return false
  }
  if (typeof column!.editable !== 'function') {
    return true
  }
  return !!row && column!.editable(row, rowIndex)
}

function getOptions(column: SpreadsheetColumn<T>): SpreadsheetSelectOption[] {
  return (column.options || []).map(option => typeof option === 'object' ? option : { label: String(option), value: option })
}

const widths = computed(() => displayColumns.value.map(column => clamp(
  columnWidths.value?.[column.key] ?? column.width ?? props.defaultColumnWidth!,
  column.minWidth ?? props.minColumnWidth!,
  column.maxWidth ?? Number.POSITIVE_INFINITY
)))
const columnOffsets = computed(() => getOffsets(widths.value))

// Layout

const rowSize = computed(() => props.rowHeight ?? ROW_HEIGHTS[(props.size ?? 'md') as keyof typeof ROW_HEIGHTS] ?? ROW_HEIGHTS.md)
const headerHeight = computed(() => props.columnHeaders ? rowSize.value : 0)
const rowHeaderSize = computed(() => {
  if (!props.rowHeaders) {
    return 0
  }
  if (props.rowHeaderWidth) {
    return props.rowHeaderWidth
  }
  return Math.max(40, String(Math.max(rowCount.value, 1)).length * 8 + 24 + (props.movableRows ? 16 : 0))
})
const bodyWidth = computed(() => columnOffsets.value[columnOffsets.value.length - 1] ?? 0)
const totalWidth = computed(() => rowHeaderSize.value + bodyWidth.value)
const totalHeight = computed(() => headerHeight.value + rowCount.value * rowSize.value)

function px(value: number) {
  return `${value}px`
}

function isRtl() {
  return !!viewport.value && getComputedStyle(viewport.value).direction === 'rtl'
}

// Virtualization

const scroll = reactive({ top: 0, left: 0, width: 0, height: 0 })

function onScroll() {
  const el = viewport.value
  if (!el) {
    return
  }
  scroll.top = el.scrollTop
  scroll.left = Math.abs(el.scrollLeft)
}

useResizeObserver(viewport, () => {
  const el = viewport.value
  if (!el) {
    return
  }
  scroll.width = el.clientWidth
  scroll.height = el.clientHeight
  onScroll()
})

const virtualizeOptions = computed(() => {
  if (!props.virtualize) {
    return { rows: false, columns: false, overscan: 0, initialRows: 0, initialColumns: 0 }
  }
  return { rows: true, columns: true, overscan: 4, initialRows: 30, initialColumns: 12, ...(props.virtualize === true ? {} : props.virtualize) }
})

const isMeasured = computed(() => scroll.width > 0 && scroll.height > 0)

const rowRange = computed<[number, number]>(() => {
  const count = rowCount.value
  if (!virtualizeOptions.value.rows) {
    return [0, count - 1]
  }
  if (!isMeasured.value) {
    return [0, Math.min(count, virtualizeOptions.value.initialRows) - 1]
  }
  const height = rowSize.value
  const first = Math.floor(scroll.top / height)
  const last = Math.floor((scroll.top + scroll.height - headerHeight.value - 1) / height)
  const { overscan } = virtualizeOptions.value
  return [Math.max(0, first - overscan), Math.min(count - 1, last + overscan)]
})

const columnRange = computed<[number, number]>(() => {
  const count = columnCount.value
  if (!virtualizeOptions.value.columns) {
    return [0, count - 1]
  }
  if (!isMeasured.value) {
    return [0, Math.min(count, virtualizeOptions.value.initialColumns) - 1]
  }
  return getVisibleRange(columnOffsets.value, scroll.left, Math.max(1, scroll.width - rowHeaderSize.value), virtualizeOptions.value.overscan)
})

function withExtras([first, last]: [number, number], extras: (number | undefined)[], count: number) {
  const indexes: number[] = []
  for (let i = first; i <= last; i++) {
    indexes.push(i)
  }
  for (const extra of extras) {
    if (extra !== undefined && extra >= 0 && extra < count && (extra < first || extra > last) && !indexes.includes(extra)) {
      indexes.push(extra)
    }
  }
  return indexes.sort((a, b) => a - b)
}

const dragging = ref<{ type: 'row' | 'column', index: number } | null>(null)
const dropTarget = ref<{ type: 'row' | 'column', index: number, edge: Edge } | null>(null)

// The active cell and the dragged row or column stay rendered while scrolled out of view, so focus and drags survive.
const renderedRows = computed(() => withExtras(rowRange.value, [
  selection.value?.anchor.row,
  dragging.value?.type === 'row' ? dragging.value.index : undefined
], rowCount.value))

const renderedColumns = computed(() => withExtras(columnRange.value, [
  selection.value?.anchor.column,
  dragging.value?.type === 'column' ? dragging.value.index : undefined
], columnCount.value))

// Selection

const range = computed(() => selection.value ? toRange(selection.value) : undefined)
const tabStop = computed<SpreadsheetCellPosition | null>(() => {
  if (selection.value) {
    return selection.value.anchor
  }
  return rowCount.value && columnCount.value ? { row: 0, column: 0 } : null
})

function clampPosition(position: SpreadsheetCellPosition): SpreadsheetCellPosition {
  return {
    row: clamp(position.row, 0, Math.max(0, rowCount.value - 1)),
    column: clamp(position.column, 0, Math.max(0, columnCount.value - 1))
  }
}

function select(anchor: SpreadsheetCellPosition, focus: SpreadsheetCellPosition = anchor) {
  if (!rowCount.value || !columnCount.value) {
    selection.value = null
    return
  }
  selection.value = {
    anchor: clampPosition(anchor),
    focus: props.selectable ? clampPosition(focus) : clampPosition(anchor)
  }
}

function selectAll() {
  if (!props.selectable) {
    return
  }
  select({ row: 0, column: 0 }, { row: rowCount.value - 1, column: columnCount.value - 1 })
}

function selectColumns(from: number, to: number) {
  select({ row: 0, column: from }, { row: rowCount.value - 1, column: to })
}

function selectRows(from: number, to: number) {
  select({ row: from, column: 0 }, { row: to, column: columnCount.value - 1 })
}

watch([rowCount, columnCount], () => {
  if (!selection.value) {
    return
  }
  if (!rowCount.value || !columnCount.value) {
    selection.value = null
    return
  }
  const { anchor, focus } = selection.value
  const next = { anchor: clampPosition(anchor), focus: clampPosition(focus) }
  if (next.anchor.row !== anchor.row || next.anchor.column !== anchor.column || next.focus.row !== focus.row || next.focus.column !== focus.column) {
    selection.value = next
  }
})

function getCellElement(position: SpreadsheetCellPosition) {
  return viewport.value?.querySelector<HTMLElement>(`[role=gridcell][data-row="${position.row}"][data-column="${position.column}"]`) ?? null
}

async function focusActiveCell() {
  await nextTick()
  if (editing.value || !tabStop.value) {
    return
  }
  getCellElement(tabStop.value)?.focus({ preventScroll: true })
}

/** Scrolls the least amount needed to bring a cell into view, below the sticky headers. */
function scrollToCell(position: SpreadsheetCellPosition) {
  const el = viewport.value
  if (!el) {
    return
  }

  const height = rowSize.value
  const top = position.row * height
  const visibleHeight = el.clientHeight - headerHeight.value
  if (top < el.scrollTop) {
    el.scrollTop = top
  } else if (top + height > el.scrollTop + visibleHeight) {
    el.scrollTop = top + height - visibleHeight
  }

  const start = columnOffsets.value[position.column] ?? 0
  const end = columnOffsets.value[position.column + 1] ?? start
  const left = Math.abs(el.scrollLeft)
  const visibleWidth = el.clientWidth - rowHeaderSize.value
  let next = left
  if (start < left) {
    next = start
  } else if (end > left + visibleWidth) {
    next = Math.min(start, end - visibleWidth)
  }
  if (next !== left) {
    el.scrollLeft = isRtl() ? -next : next
  }

  onScroll()
}

function moveTo(position: SpreadsheetCellPosition, extend = false) {
  const current = selection.value
  if (extend && props.selectable && current) {
    selection.value = { anchor: current.anchor, focus: clampPosition(position) }
    scrollToCell(clampPosition(position))
  } else {
    select(position)
    scrollToCell(clampPosition(position))
  }
  focusActiveCell()
}

// Values

function getValue(rowIndex: number, columnIndex: number) {
  const column = displayColumns.value[columnIndex]
  return column ? data.value[rowIndex]?.[column.key] : undefined
}

function emptyValue(column: SpreadsheetColumn<T>) {
  const type = getType(column)
  return type === 'checkbox' ? false : type === 'text' ? '' : null
}

function toText(value: any, column: SpreadsheetColumn<T>): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (getType(column) === 'checkbox') {
    return value ? 'TRUE' : 'FALSE'
  }
  return String(value)
}

function displayValue(value: any, column: SpreadsheetColumn<T>, row: T): string {
  if (column.format) {
    return column.format(value, row)
  }
  if (getType(column) === 'select') {
    const option = getOptions(column).find(option => option.value === value)
    if (option) {
      return option.label
    }
  }
  return value === null || value === undefined ? '' : String(value)
}

/** Converts text to a column value, or `undefined` when the text is not valid for the column. */
function parseInput(input: string, column: SpreadsheetColumn<T>, row: T): any {
  if (column.parse) {
    return column.parse(input, row)
  }
  const text = input.trim()
  switch (getType(column)) {
    case 'number': {
      if (text === '') {
        return null
      }
      const number = Number(text)
      return Number.isFinite(number) ? number : undefined
    }
    case 'checkbox':
      if (/^(?:true|1|yes|x)$/i.test(text)) {
        return true
      }
      return /^(?:false|0|no)?$/i.test(text) ? false : undefined
    case 'select': {
      if (text === '') {
        return null
      }
      const option = getOptions(column).find(option => String(option.value) === text || option.label === text)
      return option ? option.value : undefined
    }
    default:
      return input
  }
}

/** Adapts a value copied from another cell to the type of `column`, or returns `undefined` when it does not fit. */
function coerceValue(value: any, column: SpreadsheetColumn<T>, row: T): any {
  const type = getType(column)
  if (value === null || value === undefined || value === '') {
    return emptyValue(column)
  }
  if ((type === 'number' && typeof value === 'number') || (type === 'checkbox' && typeof value === 'boolean') || (type === 'text' && !column.parse)) {
    return value
  }
  if (type === 'select' && getOptions(column).some(option => option.value === value)) {
    return value
  }
  return parseInput(typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : String(value), column, row)
}

// History

const undoStack = shallowRef<T[][]>([])
const redoStack = shallowRef<T[][]>([])
const historyLimit = computed(() => props.history === false ? 0 : typeof props.history === 'number' ? props.history : 100)

function commit(next: T[], changes: SpreadsheetChange<T>[] = []) {
  if (historyLimit.value > 0) {
    undoStack.value = [...undoStack.value, data.value].slice(-historyLimit.value)
    redoStack.value = []
  }
  data.value = next
  if (changes.length) {
    emits('change', changes)
  }
}

function undo() {
  const previous = undoStack.value[undoStack.value.length - 1]
  if (!previous) {
    return
  }
  undoStack.value = undoStack.value.slice(0, -1)
  redoStack.value = [...redoStack.value, data.value]
  data.value = previous
}

function redo() {
  const next = redoStack.value[redoStack.value.length - 1]
  if (!next) {
    return
  }
  redoStack.value = redoStack.value.slice(0, -1)
  undoStack.value = [...undoStack.value, data.value]
  data.value = next
}

const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

type CellWrite = { row: number, column: number, value: any }

/** Writes values to editable cells as a single history step, copying only the rows that change. */
function writeCells(writes: CellWrite[], base: T[] = data.value) {
  const next = base === data.value ? base.slice() : base
  const copied = new Set<number>()
  const changes: SpreadsheetChange<T>[] = []

  for (const write of writes) {
    const column = displayColumns.value[write.column]
    const row = next[write.row]
    if (!row || !isCellEditable(write.row, column, row)) {
      continue
    }
    const oldValue = row[column!.key]
    if (Object.is(oldValue, write.value)) {
      continue
    }
    if (!copied.has(write.row)) {
      next[write.row] = { ...row }
      copied.add(write.row)
    }
    (next[write.row] as SpreadsheetData)[column!.key] = write.value
    changes.push({ rowIndex: write.row, row: next[write.row]!, key: column!.key, value: write.value, oldValue })
  }

  if (changes.length || base !== data.value) {
    commit(next, changes)
  }
}

function forEachInRange(target: SpreadsheetRange, callback: (row: number, column: number) => void) {
  for (let row = target.top; row <= target.bottom; row++) {
    for (let column = target.start; column <= target.end; column++) {
      callback(row, column)
    }
  }
}

function clearRange() {
  if (!range.value || !props.editable) {
    return
  }
  const writes: CellWrite[] = []
  forEachInRange(range.value, (row, column) => writes.push({ row, column, value: emptyValue(displayColumns.value[column]!) }))
  writeCells(writes)
}

function toggleCheckboxes() {
  if (!selection.value || !range.value) {
    return
  }
  const { anchor } = selection.value
  const next = !getValue(anchor.row, anchor.column)
  const writes: CellWrite[] = []
  forEachInRange(range.value, (row, column) => {
    if (getType(displayColumns.value[column]!) === 'checkbox') {
      writes.push({ row, column, value: next })
    }
  })
  writeCells(writes)
}

function fillDown() {
  if (!range.value || !props.editable) {
    return
  }
  const { top, bottom, start, end } = range.value
  const source = top === bottom ? top - 1 : top
  if (source < 0) {
    return
  }
  const writes: CellWrite[] = []
  for (let row = source + 1; row <= bottom; row++) {
    for (let column = start; column <= end; column++) {
      writes.push({ row, column, value: getValue(source, column) })
    }
  }
  writeCells(writes)
}

// Rows and displayColumns

function newRow(index: number): T {
  return props.createRow?.(index) ?? Object.fromEntries(displayColumns.value.map(column => [column.key, emptyValue(column)])) as T
}

function insertRow(index: number) {
  if (!props.editable || !props.insertRows) {
    return
  }
  const next = data.value.slice()
  const row = newRow(index)
  next.splice(index, 0, row)
  commit(next)
  emits('row-insert', index, row)
  select({ row: index, column: selection.value?.anchor.column ?? 0 })
  focusActiveCell()
}

function deleteSelectedRows() {
  if (!props.editable || !props.deleteRows || !range.value) {
    return
  }
  const { top, bottom } = range.value
  const next = data.value.slice()
  const removed = next.splice(top, bottom - top + 1)
  commit(next)
  emits('rows-delete', top, removed)
  if (next.length) {
    select({ row: Math.min(top, next.length - 1), column: selection.value?.anchor.column ?? 0 })
    focusActiveCell()
  }
}

function sortBy(columnIndex: number, direction: 'asc' | 'desc') {
  const column = displayColumns.value[columnIndex]
  if (!column || !props.editable || !props.sortable || column.sortable === false) {
    return
  }
  const factor = direction === 'asc' ? 1 : -1
  const next = data.value.slice().sort((a, b) => {
    const x = a[column.key]
    const y = b[column.key]
    const xEmpty = x === null || x === undefined || x === ''
    const yEmpty = y === null || y === undefined || y === ''
    if (xEmpty || yEmpty) {
      // Empty values stay last in both directions, as in spreadsheet apps.
      return xEmpty === yEmpty ? 0 : xEmpty ? 1 : -1
    }
    if (typeof x === 'number' && typeof y === 'number') {
      return (x - y) * factor
    }
    return String(x).localeCompare(String(y), undefined, { numeric: true }) * factor
  })
  commit(next)
  emits('sort', column.key, direction)
}

function moveRow(from: number, to: number) {
  if (!props.movableRows || from === to || to < 0 || to >= rowCount.value) {
    return
  }
  commit(moveItem(data.value, from, to))
  emits('row-move', from, to)
  const column = selection.value?.anchor.column ?? 0
  select({ row: to, column })
  scrollToCell({ row: to, column })
  focusActiveCell()
}

function moveColumn(from: number, to: number) {
  const column = displayColumns.value[from]
  if (!props.movableColumns || column?.movable === false || from === to || to < 0 || to >= columnCount.value) {
    return
  }
  columnOrder.value = moveItem(displayColumns.value.map(column => column.key as string), from, to)
  emits('column-move', column!.key, from, to)
  const row = selection.value?.anchor.row ?? 0
  select({ row, column: to })
  scrollToCell({ row, column: to })
  focusActiveCell()
}

// Editing

const editing = ref<{ row: number, column: number, draft: any } | null>(null)

function isEditingCell(row: number, column: number) {
  return editing.value?.row === row && editing.value?.column === column
}

function startEditing(position: SpreadsheetCellPosition, initial?: string) {
  const column = displayColumns.value[position.column]
  if (!isCellEditable(position.row, column) || getType(column!) === 'checkbox') {
    return
  }

  const value = getValue(position.row, position.column)
  let draft: any = initial ?? toText(value, column!)
  if (getType(column!) === 'select') {
    draft = String(getOptions(column!).findIndex(option => option.value === value))
  }

  scrollToCell(position)
  editing.value = { row: position.row, column: position.column, draft }
  emits('edit-start', { row: position.row, column: position.column })

  nextTick(() => {
    const field = getCellElement(position)?.querySelector<HTMLElement>('input, select, textarea, [contenteditable]')
    if (!field) {
      return
    }
    field.focus({ preventScroll: true })
    if (field instanceof HTMLInputElement) {
      const end = field.value.length
      field.setSelectionRange(end, end)
    } else if (field instanceof HTMLSelectElement && initial === undefined) {
      try {
        field.showPicker()
      } catch {
        // The clipboard or picker is unavailable, e.g. without permission.
      }
    }
  })
}

function commitEditing(move?: 'up' | 'down' | 'start' | 'end', value?: { raw: any }) {
  const current = editing.value
  if (!current) {
    return
  }
  editing.value = null

  const column = displayColumns.value[current.column]
  const row = data.value[current.row]
  if (column && row) {
    let next: any
    if (value) {
      next = value.raw
    } else if (getType(column) === 'select' && !column.parse) {
      next = getOptions(column)[Number(current.draft)]?.value
    } else {
      next = parseInput(String(current.draft ?? ''), column, row)
    }
    if (next !== undefined) {
      writeCells([{ row: current.row, column: current.column, value: next }])
    }
  }
  emits('edit-end', { row: current.row, column: current.column }, false)

  if (move) {
    const rtl = isRtl()
    const offsets = { up: [-1, 0], down: [1, 0], start: [0, rtl ? 1 : -1], end: [0, rtl ? -1 : 1] }[move]
    moveTo({ row: current.row + offsets[0]!, column: current.column + offsets[1]! })
  } else {
    focusActiveCell()
  }
}

function cancelEditing() {
  const current = editing.value
  editing.value = null
  if (current) {
    emits('edit-end', { row: current.row, column: current.column }, true)
  }
  focusActiveCell()
}

function onEditorBlur(row: number, column: number) {
  if (isEditingCell(row, column)) {
    commitEditing()
  }
}

function onEditorKeydown(event: KeyboardEvent) {
  if (event.isComposing) {
    return
  }
  switch (event.key) {
    case 'Enter': {
      event.preventDefault()
      const moves = { down: ['down', 'up'], end: ['end', 'start'], none: [undefined, undefined] } as const
      commitEditing(moves[props.enterDirection ?? 'down'][event.shiftKey ? 1 : 0])
      break
    }
    case 'Tab':
      event.preventDefault()
      commitEditing(event.shiftKey ? 'start' : 'end')
      break
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      cancelEditing()
      break
  }
}

// Keyboard

function onKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    return
  }
  if (editing.value) {
    onEditorKeydown(event)
    return
  }

  const target = event.target as HTMLElement
  if (target.getAttribute('role') !== 'gridcell' || !tabStop.value) {
    return
  }

  if (!selection.value) {
    select(tabStop.value)
  }
  const { anchor, focus } = selection.value!
  const mod = event.ctrlKey || event.metaKey
  const extend = event.shiftKey && !!props.selectable
  const head = extend ? focus : anchor
  const lastRow = rowCount.value - 1
  const lastColumn = columnCount.value - 1
  const rtl = isRtl()
  const page = Math.max(1, Math.floor(((viewport.value?.clientHeight ?? 0) - headerHeight.value) / rowSize.value) - 1)

  const handled = () => {
    event.preventDefault()
    event.stopPropagation()
  }

  if (event.altKey && event.shiftKey && !mod && event.key.startsWith('Arrow')) {
    handled()
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      moveRow(anchor.row, anchor.row + (event.key === 'ArrowUp' ? -1 : 1))
    } else {
      const forward = (event.key === 'ArrowRight') !== rtl
      moveColumn(anchor.column, anchor.column + (forward ? 1 : -1))
    }
    return
  }

  switch (event.key) {
    case 'ArrowUp':
      handled()
      return moveTo({ row: mod ? 0 : head.row - 1, column: head.column }, extend)
    case 'ArrowDown':
      handled()
      return moveTo({ row: mod ? lastRow : head.row + 1, column: head.column }, extend)
    case 'ArrowLeft':
    case 'ArrowRight': {
      handled()
      const forward = (event.key === 'ArrowRight') !== rtl
      const column = mod ? (forward ? lastColumn : 0) : head.column + (forward ? 1 : -1)
      return moveTo({ row: head.row, column }, extend)
    }
    case 'Home':
      handled()
      return moveTo(mod ? { row: 0, column: 0 } : { row: head.row, column: 0 }, extend)
    case 'End':
      handled()
      return moveTo(mod ? { row: lastRow, column: lastColumn } : { row: head.row, column: lastColumn }, extend)
    case 'PageUp':
      handled()
      return moveTo({ row: head.row - page, column: head.column }, extend)
    case 'PageDown':
      handled()
      return moveTo({ row: head.row + page, column: head.column }, extend)
    case 'Enter':
    case 'F2': {
      handled()
      const column = displayColumns.value[anchor.column]
      if (column && getType(column) === 'checkbox') {
        if (isCellEditable(anchor.row, column)) {
          toggleCheckboxes()
        }
        return
      }
      return startEditing(anchor)
    }
    case 'Escape':
      if (focus.row !== anchor.row || focus.column !== anchor.column) {
        handled()
        select(anchor)
      }
      return
    case 'Delete':
    case 'Backspace':
      handled()
      return clearRange()
  }

  if (event.key === ' ') {
    if (props.selectable && event.shiftKey && !mod) {
      handled()
      return selectRows(Math.min(anchor.row, focus.row), Math.max(anchor.row, focus.row))
    }
    if (props.selectable && mod && !event.shiftKey) {
      handled()
      return selectColumns(Math.min(anchor.column, focus.column), Math.max(anchor.column, focus.column))
    }
    const column = displayColumns.value[anchor.column]
    if (column && getType(column) === 'checkbox') {
      handled()
      if (isCellEditable(anchor.row, column)) {
        toggleCheckboxes()
      }
      return
    }
  }

  if (mod && !event.altKey) {
    switch (event.key.toLowerCase()) {
      case 'a':
        handled()
        return selectAll()
      case 'z':
        if (historyLimit.value) {
          handled()
          return event.shiftKey ? redo() : undo()
        }
        return
      case 'y':
        if (historyLimit.value) {
          handled()
          return redo()
        }
        return
      case 'd':
        handled()
        return fillDown()
    }
    return
  }

  // Typing a character replaces the value of the active cell, as in spreadsheet apps.
  if (props.editOnType && event.key.length === 1 && !event.altKey && !event.isComposing && isCellEditable(anchor.row, displayColumns.value[anchor.column])) {
    handled()
    startEditing(anchor, event.key)
  }
}

function onFocusin(event: FocusEvent) {
  const target = event.target as HTMLElement
  if (!selection.value && target.getAttribute('role') === 'gridcell') {
    select({ row: Number(target.dataset.row), column: Number(target.dataset.column) })
  }
}

// Clipboard

function getRangeText(target: SpreadsheetRange) {
  const rows: string[][] = []
  for (let row = target.top; row <= target.bottom; row++) {
    const values: string[] = []
    for (let column = target.start; column <= target.end; column++) {
      values.push(toText(getValue(row, column), displayColumns.value[column]!))
    }
    rows.push(values)
  }
  return toTSV(rows)
}

function pasteText(text: string) {
  if (!props.editable || !range.value) {
    return
  }
  const values = parseTSV(text)
  if (!values.length) {
    return
  }

  const { top, start } = range.value
  const writes: CellWrite[] = []
  let base = data.value
  let bottom: number
  let end: number

  if (values.length === 1 && values[0]!.length === 1) {
    // A single value fills the whole selection.
    ({ bottom, end } = range.value)
    forEachInRange(range.value, (row, column) => writes.push({ row, column, value: values[0]![0] }))
  } else {
    bottom = top + values.length - 1
    end = Math.min(columnCount.value - 1, start + Math.max(...values.map(row => row.length)) - 1)
    if (bottom >= rowCount.value) {
      if (props.insertRows) {
        base = data.value.slice()
        while (base.length <= bottom) {
          base.push(newRow(base.length))
        }
      } else {
        bottom = rowCount.value - 1
      }
    }
    values.forEach((rowValues, rowOffset) => rowValues.forEach((value, columnOffset) => {
      if (top + rowOffset <= bottom && start + columnOffset <= end) {
        writes.push({ row: top + rowOffset, column: start + columnOffset, value })
      }
    }))
  }

  const parsed = writes.map((write) => {
    const column = displayColumns.value[write.column]!
    const row = base[write.row]!
    return { ...write, value: parseInput(String(write.value), column, row) }
  }).filter(write => write.value !== undefined)

  writeCells(parsed, base)
  select({ row: top, column: start }, { row: bottom, column: end })
}

function onCopy(event: ClipboardEvent) {
  if (!props.clipboard || editing.value || !range.value) {
    return
  }
  event.preventDefault()
  event.clipboardData?.setData('text/plain', getRangeText(range.value))
}

function onCut(event: ClipboardEvent) {
  if (!props.clipboard || editing.value || !range.value) {
    return
  }
  onCopy(event)
  clearRange()
}

function onPaste(event: ClipboardEvent) {
  if (!props.clipboard || editing.value) {
    return
  }
  const text = event.clipboardData?.getData('text/plain')
  if (text) {
    event.preventDefault()
    pasteText(text)
  }
}

async function copyToClipboard(cut = false) {
  if (!range.value) {
    return
  }
  try {
    await navigator.clipboard.writeText(getRangeText(range.value))
    if (cut) {
      clearRange()
    }
  } catch {
    // The clipboard or picker is unavailable, e.g. without permission.
  }
  focusActiveCell()
}

async function pasteFromClipboard() {
  try {
    pasteText(await navigator.clipboard.readText())
  } catch {
    // The clipboard or picker is unavailable, e.g. without permission.
  }
  focusActiveCell()
}

// Pointer

function getCellAtPoint(clientX: number, clientY: number): SpreadsheetCellPosition {
  const el = viewport.value!
  const rect = el.getBoundingClientRect()
  const contentStart = rect.left + el.clientLeft
  const x = (isRtl() ? contentStart + el.clientWidth - clientX : clientX - contentStart) + Math.abs(el.scrollLeft) - rowHeaderSize.value
  const y = clientY - rect.top - el.clientTop + el.scrollTop - headerHeight.value

  return {
    row: clamp(Math.floor(y / rowSize.value), 0, rowCount.value - 1),
    column: x < 0 ? 0 : clamp(findIndexAt(columnOffsets.value, x), 0, columnCount.value - 1)
  }
}

const fillTarget = ref<{ range: SpreadsheetRange, axis: 'row' | 'column', reverse: boolean } | null>(null)
let pointerDrag: PointerDrag | null = null

function getFillTarget(position: SpreadsheetCellPosition) {
  const current = range.value
  if (!current || isInRange(current, position.row, position.column)) {
    return null
  }
  const rowDistance = position.row > current.bottom ? position.row - current.bottom : position.row < current.top ? current.top - position.row : 0
  const columnDistance = position.column > current.end ? position.column - current.end : position.column < current.start ? current.start - position.column : 0
  if (rowDistance >= columnDistance) {
    const reverse = position.row < current.top
    return {
      axis: 'row' as const,
      reverse,
      range: { ...current, top: reverse ? position.row : current.bottom + 1, bottom: reverse ? current.top - 1 : position.row }
    }
  }
  const reverse = position.column < current.start
  return {
    axis: 'column' as const,
    reverse,
    range: { ...current, start: reverse ? position.column : current.end + 1, end: reverse ? current.start - 1 : position.column }
  }
}

function applyFill() {
  const current = range.value
  const target = fillTarget.value
  fillTarget.value = null
  if (!current || !target || !props.editable) {
    return
  }

  const writes: CellWrite[] = []
  if (target.axis === 'row') {
    const count = target.range.bottom - target.range.top + 1
    for (let column = current.start; column <= current.end; column++) {
      const source = []
      for (let row = current.top; row <= current.bottom; row++) {
        source.push(getValue(row, column))
      }
      const values = fillSeries(target.reverse ? source.reverse() : source, count)
      values.forEach((value, index) => writes.push({ row: target.reverse ? current.top - 1 - index : current.bottom + 1 + index, column, value }))
    }
  } else {
    const count = target.range.end - target.range.start + 1
    for (let row = current.top; row <= current.bottom; row++) {
      const source = []
      for (let column = current.start; column <= current.end; column++) {
        source.push(getValue(row, column))
      }
      const values = fillSeries(target.reverse ? source.reverse() : source, count)
      values.forEach((value, index) => writes.push({ row, column: target.reverse ? current.start - 1 - index : current.end + 1 + index, value }))
    }
  }

  writeCells(writes.map(write => ({ ...write, value: coerceValue(write.value, displayColumns.value[write.column]!, data.value[write.row]!) })).filter(write => write.value !== undefined))
  const merged = {
    top: Math.min(current.top, target.range.top),
    bottom: Math.max(current.bottom, target.range.bottom),
    start: Math.min(current.start, target.range.start),
    end: Math.max(current.end, target.range.end)
  }
  const anchor = selection.value!.anchor
  select(anchor, {
    row: anchor.row === merged.top ? merged.bottom : merged.top,
    column: anchor.column === merged.start ? merged.end : merged.start
  })
}

function updatePointerDrag() {
  if (!pointerDrag || !selection.value) {
    return
  }
  const position = getCellAtPoint(pointerDrag.x, pointerDrag.y)
  switch (pointerDrag.mode) {
    case 'cells':
      selection.value = { anchor: selection.value.anchor, focus: position }
      break
    case 'columns':
      selectColumns(pointerDrag.start, position.column)
      break
    case 'rows':
      selectRows(pointerDrag.start, position.row)
      break
    case 'fill':
      fillTarget.value = getFillTarget(position)
      break
  }
}

function autoScrollPointerDrag() {
  const el = viewport.value
  if (!pointerDrag || !el) {
    return
  }
  const rect = el.getBoundingClientRect()
  const threshold = 32
  const speed = (distance: number) => Math.min(24, Math.ceil(distance / 3))
  const rtl = isRtl()

  const top = rect.top + el.clientTop + headerHeight.value
  const bottom = rect.top + el.clientTop + el.clientHeight
  let dy = 0
  if (pointerDrag.mode !== 'columns') {
    if (pointerDrag.y < top + threshold) {
      dy = -speed(top + threshold - pointerDrag.y)
    } else if (pointerDrag.y > bottom - threshold) {
      dy = speed(pointerDrag.y - bottom + threshold)
    }
  }

  const contentLeft = rect.left + el.clientLeft
  const contentRight = contentLeft + el.clientWidth
  const startEdge = rtl ? contentRight - rowHeaderSize.value : contentLeft + rowHeaderSize.value
  let dx = 0
  if (pointerDrag.mode !== 'rows') {
    const fromStart = rtl ? startEdge - pointerDrag.x : pointerDrag.x - startEdge
    const fromEnd = rtl ? pointerDrag.x - contentLeft : contentRight - pointerDrag.x
    if (fromStart < threshold) {
      dx = -speed(threshold - fromStart)
    } else if (fromEnd < threshold) {
      dx = speed(threshold - fromEnd)
    }
  }

  if (dx || dy) {
    el.scrollTop += dy
    el.scrollLeft += rtl ? -dx : dx
    onScroll()
    updatePointerDrag()
  }

  pointerDrag.frame = requestAnimationFrame(autoScrollPointerDrag)
}

function onPointerMove(event: PointerEvent) {
  if (!pointerDrag) {
    return
  }
  pointerDrag.x = event.clientX
  pointerDrag.y = event.clientY
  updatePointerDrag()
}

function stopPointerDrag() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopPointerDrag)
  window.removeEventListener('pointercancel', stopPointerDrag)
  if (!pointerDrag) {
    return
  }
  if (pointerDrag.frame) {
    cancelAnimationFrame(pointerDrag.frame)
  }
  const mode = pointerDrag.mode
  pointerDrag = null
  if (mode === 'fill') {
    applyFill()
  }
  focusActiveCell()
}

function startPointerDrag(event: PointerEvent, mode: PointerDrag['mode'], start = 0) {
  if (event.pointerType === 'touch' && mode !== 'fill') {
    // Dragging on touch screens scrolls the spreadsheet instead of extending the selection.
    return
  }
  pointerDrag = { mode, start, x: event.clientX, y: event.clientY }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopPointerDrag)
  window.addEventListener('pointercancel', stopPointerDrag)
  pointerDrag.frame = requestAnimationFrame(autoScrollPointerDrag)
}

function startResize(event: PointerEvent, columnIndex: number) {
  const column = displayColumns.value[columnIndex]
  if (!column) {
    return
  }
  event.preventDefault()
  const startX = event.clientX
  const startWidth = widths.value[columnIndex]!
  const direction = isRtl() ? -1 : 1

  const onMove = (moveEvent: PointerEvent) => {
    const width = clamp(Math.round(startWidth + (moveEvent.clientX - startX) * direction), column.minWidth ?? props.minColumnWidth!, column.maxWidth ?? Number.POSITIVE_INFINITY)
    columnWidths.value = { ...columnWidths.value, [column.key]: width }
  }
  const onUp = () => {
    const width = columnWidths.value?.[column.key]
    if (width !== undefined && width !== startWidth) {
      emits('column-resize', column.key, width)
    }
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

function resetWidth(columnIndex: number) {
  const column = displayColumns.value[columnIndex]
  if (!column || !columnWidths.value?.[column.key]) {
    return
  }
  const { [column.key]: _, ...rest } = columnWidths.value
  columnWidths.value = rest
  emits('column-resize', column.key, undefined)
}

function onDblclick(event: MouseEvent) {
  const cell = (event.target as HTMLElement).closest<HTMLElement>('[role=gridcell]')
  if (!cell || editing.value || (event.target as HTMLElement).closest('[data-checkbox]')) {
    return
  }
  startEditing({ row: Number(cell.dataset.row), column: Number(cell.dataset.column) })
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!viewport.value || !rowCount.value || !columnCount.value) {
    return
  }
  if (target.closest('[data-drag-handle]')) {
    return
  }

  const editingCell = editing.value && getCellElement(editing.value)
  if (editingCell && editingCell.contains(target)) {
    return
  }

  if (editing.value) {
    commitEditing()
  }

  const resizeHandle = target.closest<HTMLElement>('[data-resize-handle]')
  if (resizeHandle) {
    if (event.button === 0) {
      startResize(event, Number(resizeHandle.dataset.column))
    }
    return
  }

  if (target.closest('[data-fill-handle]')) {
    if (event.button === 0) {
      event.preventDefault()
      startPointerDrag(event, 'fill')
    }
    return
  }

  const extend = event.shiftKey && !!props.selectable && !!selection.value

  if (target.closest('[data-corner]')) {
    selectAll()
    focusActiveCell()
    return
  }

  const columnHeader = target.closest<HTMLElement>('[role=columnheader][data-column]')
  if (columnHeader) {
    const column = Number(columnHeader.dataset.column)
    if (!props.selectable) {
      moveTo({ row: selection.value?.anchor.row ?? 0, column })
      return
    }
    const from = extend ? selection.value!.anchor.column : column
    if (event.button === 2 && range.value && column >= range.value.start && column <= range.value.end) {
      return
    }
    selectColumns(from, column)
    if (event.button === 0) {
      startPointerDrag(event, 'columns', from)
    }
    focusActiveCell()
    return
  }

  const rowHeader = target.closest<HTMLElement>('[role=rowheader][data-row]')
  if (rowHeader) {
    const row = Number(rowHeader.dataset.row)
    if (!props.selectable) {
      moveTo({ row, column: selection.value?.anchor.column ?? 0 })
      return
    }
    const from = extend ? selection.value!.anchor.row : row
    if (event.button === 2 && range.value && row >= range.value.top && row <= range.value.bottom) {
      return
    }
    selectRows(from, row)
    if (event.button === 0) {
      startPointerDrag(event, 'rows', from)
    }
    focusActiveCell()
    return
  }

  const cell = target.closest<HTMLElement>('[role=gridcell]')
  if (!cell) {
    return
  }
  const position = { row: Number(cell.dataset.row), column: Number(cell.dataset.column) }

  if (event.button === 2) {
    // Right click keeps the selection when it happens inside it, so the context menu acts on the whole range.
    if (!isInRange(range.value, position.row, position.column)) {
      select(position)
    }
    focusActiveCell()
    return
  }
  if (event.button !== 0) {
    return
  }

  if (extend) {
    selection.value = { anchor: selection.value!.anchor, focus: position }
  } else {
    select(position)
  }

  const column = displayColumns.value[position.column]!
  if (target.closest('[data-checkbox]') && isCellEditable(position.row, column) && !extend) {
    writeCells([{ row: position.row, column: position.column, value: !getValue(position.row, position.column) }])
  } else if (props.selectable) {
    startPointerDrag(event, 'cells')
  }
  focusActiveCell()
}

// Drag and drop

const dndEntries = new Map<HTMLElement, { info: DndInfo, cleanup: () => void }>()

function getEdge(type: DndInfo['type'], clientX: number, clientY: number, element: Element): Edge {
  const rect = element.getBoundingClientRect()
  if (type === 'row') {
    return clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  }
  const before = clientX < rect.left + rect.width / 2
  return before !== isRtl() ? 'before' : 'after'
}

function registerDnd(el: HTMLElement, info: DndInfo) {
  const entry = { info, cleanup: () => {} }
  dndEntries.set(el, entry)

  const cleanups: (() => void)[] = []
  const handle = info.drag ? el.querySelector<HTMLElement>('[data-drag-handle]') : null
  if (handle) {
    cleanups.push(draggable({
      element: handle,
      getInitialData: () => ({ spreadsheet: id, type: entry.info.type, index: entry.info.index }),
      onGenerateDragPreview: ({ location, nativeSetDragImage }) => {
        const rect = el.getBoundingClientRect()
        const { clientX, clientY } = location.current.input
        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: () => ({ x: clientX - rect.left, y: clientY - rect.top }),
          render: ({ container }) => {
            // The header is positioned within the grid, so the preview is a copy laid out on its own.
            const preview = el.cloneNode(true) as HTMLElement
            Object.assign(preview.style, {
              position: 'relative',
              insetInlineStart: '0px',
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              fontSize: getComputedStyle(el).fontSize,
              opacity: '1'
            })
            container.appendChild(preview)
          }
        })
      },
      onDragStart: () => {
        if (editing.value) {
          commitEditing()
        }
        dragging.value = { type: entry.info.type, index: entry.info.index }
      }
    }))
  }
  if (info.drop) {
    cleanups.push(dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.spreadsheet === id && source.data.type === entry.info.type,
      getData: ({ input, element }) => ({ index: entry.info.index, edge: getEdge(entry.info.type, input.clientX, input.clientY, element) }),
      onDrag: ({ self }) => {
        dropTarget.value = { type: entry.info.type, index: self.data.index as number, edge: self.data.edge as Edge }
      },
      onDragLeave: () => {
        dropTarget.value = null
      }
    }))
  }
  entry.cleanup = combine(...cleanups)
}

const vDnd: Directive<HTMLElement, DndInfo> = {
  mounted(el, { value }) {
    registerDnd(el, value)
  },
  updated(el, { value }) {
    const entry = dndEntries.get(el)
    if (!entry) {
      return registerDnd(el, value)
    }
    if (entry.info.drag !== value.drag || entry.info.drop !== value.drop || entry.info.type !== value.type) {
      entry.cleanup()
      return registerDnd(el, value)
    }
    entry.info = value
  },
  beforeUnmount(el) {
    dndEntries.get(el)?.cleanup()
    dndEntries.delete(el)
  }
}

let cleanupMonitor: (() => void) | undefined

onMounted(() => {
  if (!viewport.value) {
    return
  }
  cleanupMonitor = combine(
    monitorForElements({
      canMonitor: ({ source }) => source.data.spreadsheet === id,
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0]
        dragging.value = null
        dropTarget.value = null
        if (!target) {
          return
        }
        const from = source.data.index as number
        const over = target.data.index as number
        let to = target.data.edge === 'after' ? over + 1 : over
        if (to > from) {
          to -= 1
        }
        if (source.data.type === 'column') {
          moveColumn(from, to)
        } else {
          moveRow(from, to)
        }
      }
    }),
    autoScrollForElements({
      element: viewport.value,
      canScroll: ({ source }) => source.data.spreadsheet === id
    })
  )
})

onBeforeUnmount(() => {
  cleanupMonitor?.()
  stopPointerDrag()
})

const dropIndicatorStyle = computed(() => {
  const target = dropTarget.value
  if (!target) {
    return
  }
  if (target.type === 'column') {
    const offset = columnOffsets.value[target.edge === 'after' ? target.index + 1 : target.index] ?? 0
    return { insetInlineStart: px(rowHeaderSize.value + offset - 1), top: '0px', width: '2px', height: px(totalHeight.value) }
  }
  const offset = (target.edge === 'after' ? target.index + 1 : target.index) * rowSize.value
  return { insetInlineStart: '0px', top: px(headerHeight.value + offset - 1), width: px(totalWidth.value), height: '2px' }
})

// Rendering

function getRangeStyle(target: SpreadsheetRange) {
  const start = columnOffsets.value[target.start] ?? 0
  const end = columnOffsets.value[target.end + 1] ?? start
  return {
    top: px(headerHeight.value + target.top * rowSize.value - 1),
    height: px((target.bottom - target.top + 1) * rowSize.value + 1),
    insetInlineStart: px(rowHeaderSize.value + start - 1),
    width: px(end - start + 1)
  }
}

const selectionStyle = computed(() => range.value && rowCount.value && columnCount.value ? getRangeStyle(range.value) : undefined)
const fillPreviewStyle = computed(() => fillTarget.value ? getRangeStyle(fillTarget.value.range) : undefined)

// Classes are computed once per column, unless the column decides its classes or editability for each row.
const cellClasses = computed(() => displayColumns.value.map(column => typeof column.class === 'function' || typeof column.editable === 'function'
  ? undefined
  : ui.value.cell({
      align: getAlign(column),
      readonly: !!props.editable && column.editable === false,
      class: [props.ui?.cell, column.class]
    })))

function getCellClass(rowIndex: number, columnIndex: number) {
  const cached = cellClasses.value[columnIndex]
  if (cached !== undefined) {
    return cached
  }
  const column = displayColumns.value[columnIndex]!
  const row = data.value[rowIndex]!
  return ui.value.cell({
    align: getAlign(column),
    readonly: !!props.editable && !isCellEditable(rowIndex, column, row),
    class: [props.ui?.cell, typeof column.class === 'function' ? column.class(row, rowIndex) : column.class]
  })
}

function getColumnHeaderClass(columnIndex: number) {
  const column = displayColumns.value[columnIndex]!
  return ui.value.columnHeader({
    dragging: dragging.value?.type === 'column' && dragging.value.index === columnIndex,
    class: [props.ui?.columnHeader, column.headerClass]
  })
}

const rowHeaderClasses = computed(() => ({
  idle: ui.value.rowHeader({ class: props.ui?.rowHeader }),
  dragging: ui.value.rowHeader({ dragging: true, class: props.ui?.rowHeader })
}))

const rowIndexOffset = computed(() => props.columnHeaders ? 2 : 1)
const columnIndexOffset = computed(() => props.rowHeaders ? 2 : 1)

function isColumnMovable(column: SpreadsheetColumn<T>) {
  return !!props.movableColumns && column.movable !== false
}

function cellSlotProps(rowIndex: number, columnIndex: number): SpreadsheetCellSlotProps<T> {
  return {
    row: data.value[rowIndex]!,
    rowIndex,
    column: displayColumns.value[columnIndex]!,
    columnIndex,
    value: getValue(rowIndex, columnIndex),
    active: selection.value?.anchor.row === rowIndex && selection.value?.anchor.column === columnIndex,
    selected: isInRange(range.value, rowIndex, columnIndex)
  }
}

function editorSlotProps(rowIndex: number, columnIndex: number): SpreadsheetEditorSlotProps<T> {
  return {
    ...cellSlotProps(rowIndex, columnIndex),
    draft: editing.value?.draft,
    update: (draft: any) => {
      if (editing.value) {
        editing.value.draft = draft
      }
    },
    commit: (...args: any[]) => commitEditing(undefined, args.length ? { raw: args[0] } : undefined),
    cancel: cancelEditing
  }
}

const menuItems = computed<ContextMenuItem[][]>(() => {
  const groups: ContextMenuItem[][] = []
  const anchor = selection.value?.anchor

  if (props.clipboard) {
    groups.push([
      ...(props.editable ? [{ label: t('spreadsheet.cut'), kbds: ['meta', 'x'], onSelect: () => copyToClipboard(true) }] : []),
      { label: t('spreadsheet.copy'), kbds: ['meta', 'c'], onSelect: () => copyToClipboard() },
      ...(props.editable ? [{ label: t('spreadsheet.paste'), kbds: ['meta', 'v'], onSelect: () => pasteFromClipboard() }] : [])
    ])
  }

  if (props.editable && historyLimit.value) {
    groups.push([
      { label: t('spreadsheet.undo'), kbds: ['meta', 'z'], disabled: !canUndo.value, onSelect: () => {
        undo()
        focusActiveCell()
      } },
      { label: t('spreadsheet.redo'), kbds: ['shift', 'meta', 'z'], disabled: !canRedo.value, onSelect: () => {
        redo()
        focusActiveCell()
      } }
    ])
  }

  if (props.editable && anchor && (props.insertRows || props.deleteRows)) {
    groups.push([
      ...(props.insertRows
        ? [
            { label: t('spreadsheet.insertRowAbove'), onSelect: () => insertRow(range.value?.top ?? anchor.row) },
            { label: t('spreadsheet.insertRowBelow'), onSelect: () => insertRow((range.value?.bottom ?? anchor.row) + 1) }
          ]
        : []),
      ...(props.deleteRows ? [{ label: t('spreadsheet.deleteRows'), color: 'error' as const, onSelect: () => deleteSelectedRows() }] : [])
    ])
  }

  if (props.editable && props.sortable && anchor && displayColumns.value[anchor.column]?.sortable !== false) {
    groups.push([
      { label: t('spreadsheet.sortAscending'), icon: props.sortAscendingIcon || appConfig.ui.icons.arrowDown, onSelect: () => sortBy(anchor.column, 'asc') },
      { label: t('spreadsheet.sortDescending'), icon: props.sortDescendingIcon || appConfig.ui.icons.arrowUp, onSelect: () => sortBy(anchor.column, 'desc') }
    ])
  }

  if (props.editable && anchor) {
    groups.push([{ label: t('spreadsheet.clear'), kbds: ['delete'], onSelect: () => {
      clearRange()
      focusActiveCell()
    } }])
  }

  if (props.selectable) {
    groups.push([{ label: t('spreadsheet.selectAll'), kbds: ['meta', 'a'], onSelect: () => {
      selectAll()
      focusActiveCell()
    } }])
  }

  const items = groups.filter(group => group.length)
  if (!props.contextMenuItems) {
    return items
  }
  return props.contextMenuItems(items, {
    selection: selection.value,
    range: range.value,
    column: anchor ? displayColumns.value[anchor.column] : undefined
  }).filter(group => group.length)
})

const contextMenuProps = computed(() => typeof props.contextMenu === 'object' ? props.contextMenu : {})

defineExpose({
  /** The scroll container of the spreadsheet. */
  viewport,
  select,
  selectAll,
  scrollToCell,
  edit: startEditing,
  undo,
  redo,
  canUndo,
  canRedo
})
</script>

<template>
  <UContextMenu :size="props.size" v-bind="contextMenuProps" :items="menuItems" :disabled="!props.contextMenu || !menuItems.length">
    <Primitive
      ref="rootRef"
      :as="props.as"
      role="grid"
      data-slot="root"
      v-bind="$attrs"
      :aria-rowcount="rowCount + (props.columnHeaders ? 1 : 0)"
      :aria-colcount="columnCount + (props.rowHeaders ? 1 : 0)"
      :aria-multiselectable="props.selectable ? true : undefined"
      :aria-readonly="props.editable ? undefined : true"
      :aria-busy="props.loading ? true : undefined"
      :class="ui.root({ class: [props.ui?.root, props.class] })"
      @scroll.passive="onScroll"
      @keydown="onKeydown"
      @focusin="onFocusin"
      @pointerdown="onPointerDown"
      @dblclick="onDblclick"
      @copy="onCopy"
      @cut="onCut"
      @paste="onPaste"
    >
      <div role="none" data-slot="canvas" :class="ui.canvas({ class: props.ui?.canvas })" :style="{ width: px(totalWidth), height: px(totalHeight) }">
        <div
          v-if="props.columnHeaders"
          role="row"
          aria-rowindex="1"
          data-slot="header"
          :class="ui.header({ class: props.ui?.header })"
          :style="{ width: px(totalWidth), height: px(headerHeight) }"
        >
          <div
            v-if="props.rowHeaders"
            role="columnheader"
            aria-colindex="1"
            data-corner
            data-slot="corner"
            :class="ui.corner({ class: props.ui?.corner })"
            :style="{ width: px(rowHeaderSize) }"
          >
            <span data-slot="cornerLabel" :class="ui.cornerLabel({ class: props.ui?.cornerLabel })">{{ t('spreadsheet.selectAll') }}</span>
          </div>

          <div
            v-for="columnIndex in renderedColumns"
            :key="displayColumns[columnIndex]!.key"
            v-dnd="{ type: 'column', index: columnIndex, drag: isColumnMovable(displayColumns[columnIndex]!), drop: !!props.movableColumns }"
            role="columnheader"
            :aria-colindex="columnIndex + columnIndexOffset"
            :data-column="columnIndex"
            :data-highlighted="range && columnIndex >= range.start && columnIndex <= range.end ? true : undefined"
            data-slot="columnHeader"
            :class="getColumnHeaderClass(columnIndex)"
            :style="{ insetInlineStart: px(rowHeaderSize + columnOffsets[columnIndex]!), width: px(widths[columnIndex]!) }"
          >
            <span
              v-if="isColumnMovable(displayColumns[columnIndex]!)"
              data-drag-handle
              aria-hidden="true"
              data-slot="dragHandle"
              :class="ui.dragHandle({ class: props.ui?.dragHandle })"
            >
              <UIcon :name="props.dragIcon || appConfig.ui.icons.drag" data-slot="dragHandleIcon" :class="ui.dragHandleIcon({ class: props.ui?.dragHandleIcon })" />
            </span>

            <slot :name="(`${displayColumns[columnIndex]!.key}-header` as keyof SpreadsheetSlots<T>)" :column="displayColumns[columnIndex]!" :column-index="columnIndex">
              <slot name="header" :column="displayColumns[columnIndex]!" :column-index="columnIndex">
                <span data-slot="columnHeaderLabel" :class="ui.columnHeaderLabel({ class: props.ui?.columnHeaderLabel })">
                  {{ displayColumns[columnIndex]!.label ?? displayColumns[columnIndex]!.key }}
                </span>
              </slot>
            </slot>

            <span
              v-if="props.resizableColumns && displayColumns[columnIndex]!.resizable !== false"
              data-resize-handle
              :data-column="columnIndex"
              aria-hidden="true"
              data-slot="resizeHandle"
              :class="ui.resizeHandle({ class: props.ui?.resizeHandle })"
              @dblclick="resetWidth(columnIndex)"
            />
          </div>
        </div>

        <div
          v-if="props.loading && props.columnHeaders"
          aria-hidden="true"
          data-slot="loadingBar"
          :class="ui.loadingBar({ class: props.ui?.loadingBar })"
          :style="{ top: px(headerHeight - 1), marginTop: '-1px', width: scroll.width ? px(scroll.width) : '100%' }"
        />

        <div
          v-for="rowIndex in renderedRows"
          :key="rowIndex"
          v-dnd="{ type: 'row', index: rowIndex, drop: !!props.movableRows }"
          role="row"
          :aria-rowindex="rowIndex + rowIndexOffset"
          data-slot="row"
          :class="ui.row({ class: props.ui?.row })"
          :style="{ top: px(headerHeight + rowIndex * rowSize), width: px(totalWidth), height: px(rowSize) }"
        >
          <div
            v-if="props.rowHeaders"
            v-dnd="{ type: 'row', index: rowIndex, drag: !!props.movableRows }"
            role="rowheader"
            aria-colindex="1"
            :data-row="rowIndex"
            :data-highlighted="range && rowIndex >= range.top && rowIndex <= range.bottom ? true : undefined"
            data-slot="rowHeader"
            :class="dragging?.type === 'row' && dragging.index === rowIndex ? rowHeaderClasses.dragging : rowHeaderClasses.idle"
            :style="{ width: px(rowHeaderSize) }"
          >
            <span
              v-if="props.movableRows"
              data-drag-handle
              aria-hidden="true"
              data-slot="dragHandle"
              :class="ui.dragHandle({ class: props.ui?.dragHandle })"
            >
              <UIcon :name="props.dragIcon || appConfig.ui.icons.drag" data-slot="dragHandleIcon" :class="ui.dragHandleIcon({ class: props.ui?.dragHandleIcon })" />
            </span>

            <slot name="row-header" :row="data[rowIndex]!" :row-index="rowIndex">
              <span data-slot="rowHeaderLabel" :class="ui.rowHeaderLabel({ class: props.ui?.rowHeaderLabel })">{{ rowIndex + 1 }}</span>
            </slot>
          </div>

          <div
            v-for="columnIndex in renderedColumns"
            :key="displayColumns[columnIndex]!.key"
            role="gridcell"
            :aria-colindex="columnIndex + columnIndexOffset"
            :aria-selected="props.selectable ? isInRange(range, rowIndex, columnIndex) : undefined"
            :aria-readonly="props.editable && !isCellEditable(rowIndex, displayColumns[columnIndex]) ? true : undefined"
            :tabindex="tabStop?.row === rowIndex && tabStop?.column === columnIndex ? 0 : -1"
            :data-row="rowIndex"
            :data-column="columnIndex"
            :data-active="selection?.anchor.row === rowIndex && selection?.anchor.column === columnIndex ? true : undefined"
            :data-selected="isInRange(range, rowIndex, columnIndex) && !(selection?.anchor.row === rowIndex && selection?.anchor.column === columnIndex) ? true : undefined"
            data-slot="cell"
            :class="getCellClass(rowIndex, columnIndex)"
            :style="{ insetInlineStart: px(rowHeaderSize + columnOffsets[columnIndex]!), width: px(widths[columnIndex]!) }"
          >
            <template v-if="isEditingCell(rowIndex, columnIndex)">
              <slot :name="(`${displayColumns[columnIndex]!.key}-editor` as keyof SpreadsheetSlots<T>)" v-bind="editorSlotProps(rowIndex, columnIndex)">
                <slot name="editor" v-bind="editorSlotProps(rowIndex, columnIndex)">
                  <select
                    v-if="getType(displayColumns[columnIndex]!) === 'select'"
                    :value="editing!.draft"
                    :aria-label="displayColumns[columnIndex]!.label ?? displayColumns[columnIndex]!.key"
                    data-slot="editor"
                    :class="ui.editor({ class: props.ui?.editor })"
                    @change="editing!.draft = ($event.target as HTMLSelectElement).value; commitEditing()"
                    @blur="onEditorBlur(rowIndex, columnIndex)"
                  >
                    <option value="-1" />
                    <option v-for="(option, index) in getOptions(displayColumns[columnIndex]!)" :key="index" :value="String(index)">
                      {{ option.label }}
                    </option>
                  </select>
                  <input
                    v-else
                    :value="editing!.draft"
                    type="text"
                    :inputmode="getType(displayColumns[columnIndex]!) === 'number' ? 'decimal' : undefined"
                    autocomplete="off"
                    :placeholder="displayColumns[columnIndex]!.placeholder"
                    :aria-label="displayColumns[columnIndex]!.label ?? displayColumns[columnIndex]!.key"
                    data-slot="editor"
                    :class="ui.editor({ class: props.ui?.editor })"
                    @input="editing!.draft = ($event.target as HTMLInputElement).value"
                    @blur="onEditorBlur(rowIndex, columnIndex)"
                  >
                </slot>
              </slot>
            </template>

            <slot v-else :name="(`${displayColumns[columnIndex]!.key}-cell` as keyof SpreadsheetSlots<T>)" v-bind="cellSlotProps(rowIndex, columnIndex)">
              <slot name="cell" v-bind="cellSlotProps(rowIndex, columnIndex)">
                <span
                  v-if="getType(displayColumns[columnIndex]!) === 'checkbox'"
                  role="checkbox"
                  :aria-checked="!!getValue(rowIndex, columnIndex)"
                  :aria-readonly="!isCellEditable(rowIndex, displayColumns[columnIndex]) || undefined"
                  :aria-label="displayColumns[columnIndex]!.label ?? displayColumns[columnIndex]!.key"
                  data-checkbox
                  :data-state="getValue(rowIndex, columnIndex) ? 'checked' : 'unchecked'"
                  data-slot="checkbox"
                  :class="ui.checkbox({ class: props.ui?.checkbox })"
                >
                  <UIcon v-if="getValue(rowIndex, columnIndex)" :name="props.checkedIcon || appConfig.ui.icons.check" data-slot="checkboxIcon" :class="ui.checkboxIcon({ class: props.ui?.checkboxIcon })" />
                </span>
                <span v-else data-slot="cellValue" :class="ui.cellValue({ class: props.ui?.cellValue })">
                  {{ displayValue(getValue(rowIndex, columnIndex), displayColumns[columnIndex]!, data[rowIndex]!) }}
                </span>
              </slot>
            </slot>
          </div>
        </div>

        <div v-if="selectionStyle" aria-hidden="true" data-slot="selection" :class="ui.selection({ class: props.ui?.selection })" :style="selectionStyle">
          <span
            v-if="props.fillHandle && props.editable && !editing"
            data-fill-handle
            aria-hidden="true"
            data-slot="fillHandle"
            :class="ui.fillHandle({ class: props.ui?.fillHandle })"
          />
        </div>

        <div v-if="fillPreviewStyle" aria-hidden="true" data-slot="fillPreview" :class="ui.fillPreview({ class: props.ui?.fillPreview })" :style="fillPreviewStyle" />

        <div v-if="dropIndicatorStyle" aria-hidden="true" data-slot="dropIndicator" :class="ui.dropIndicator({ class: props.ui?.dropIndicator })" :style="dropIndicatorStyle" />
      </div>

      <div
        v-if="!rowCount"
        role="row"
        :aria-rowindex="props.columnHeaders ? 2 : 1"
        :data-slot="props.loading ? 'loading' : 'empty'"
        :class="props.loading ? ui.loading({ class: props.ui?.loading }) : ui.empty({ class: props.ui?.empty })"
        :style="{ width: scroll.width ? px(scroll.width) : undefined }"
      >
        <div role="gridcell" :aria-colspan="columnCount || undefined">
          <slot v-if="props.loading" name="loading" />
          <slot v-else name="empty">
            {{ props.empty || t('table.noData') }}
          </slot>
        </div>
      </div>
    </Primitive>
  </UContextMenu>
</template>
