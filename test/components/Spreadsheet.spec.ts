import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { flushPromises } from '@vue/test-utils'
import type { DOMWrapper, VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Spreadsheet from '../../src/runtime/components/Spreadsheet.vue'
import type { SpreadsheetColumn, SpreadsheetProps } from '../../src/runtime/components/Spreadsheet.vue'
import { renderEach } from '../component-render'
import theme from '#build/ui/spreadsheet'

type Row = { name: string, age: number | null, active: boolean, role: string | null }

const data: Row[] = [
  { name: 'Alice', age: 31, active: true, role: 'admin' },
  { name: 'Bob', age: 27, active: false, role: 'user' },
  { name: 'Carol', age: 45, active: true, role: 'user' }
]

const columns: SpreadsheetColumn<Row>[] = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'active', label: 'Active', type: 'checkbox' },
  { key: 'role', label: 'Role', type: 'select', options: ['admin', 'user'] }
]

async function mount(props: Partial<SpreadsheetProps<Row>> & Record<string, any> = {}) {
  const wrapper = await mountSuspended(Spreadsheet, {
    attachTo: document.body,
    props: {
      'data': data,
      columns,
      'aria-label': 'People',
      'onUpdate:data': (value: Row[]) => wrapper.setProps({ data: value }),
      'onUpdate:selection': (value: any) => wrapper.setProps({ selection: value }),
      'onUpdate:columnOrder': (value: string[]) => wrapper.setProps({ columnOrder: value }),
      ...props
    } as any
  })
  return wrapper as VueWrapper<any>
}

function getCell(wrapper: VueWrapper<any>, row: number, column: number) {
  return wrapper.find(`[role=gridcell][data-row="${row}"][data-column="${column}"]`)
}

async function keydown(element: DOMWrapper<Element> | Element, init: KeyboardEventInit) {
  const el = 'element' in element ? element.element : element
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  el.dispatchEvent(event)
  await flushPromises()
  return event
}

async function pointerdown(element: DOMWrapper<Element>, init: PointerEventInit = {}) {
  element.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse', ...init }))
  window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
  await flushPromises()
}

function clipboardEvent(type: 'copy' | 'cut' | 'paste', text = '') {
  const event = new Event(type, { bubbles: true, cancelable: true }) as ClipboardEvent
  const setData = vi.fn()
  Object.defineProperty(event, 'clipboardData', { value: { setData, getData: () => text } })
  return { event, setData }
}

function emitted(wrapper: VueWrapper<any>, name: string) {
  return wrapper.emitted(name) as any[][] | undefined
}

describe('Spreadsheet', () => {
  const sizes = Object.keys(theme.variants.size) as any

  const props = { data, columns, 'aria-label': 'People' }

  renderEach(Spreadsheet, [
    // Props
    ['with data', { props }],
    ['without columns', { props: { data, 'aria-label': 'People' } }],
    ['without data', { props: { 'aria-label': 'People' } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { ...props, size } }]),
    ['with color neutral', { props: { ...props, color: 'neutral' } }],
    ['with selection', { props: { ...props, selection: { anchor: { row: 0, column: 0 }, focus: { row: 1, column: 1 } } } }],
    ['without editable', { props: { ...props, editable: false } }],
    ['without selectable', { props: { ...props, selectable: false } }],
    ['without rowHeaders', { props: { ...props, rowHeaders: false } }],
    ['without columnHeaders', { props: { ...props, columnHeaders: false } }],
    ['without resizableColumns', { props: { ...props, resizableColumns: false } }],
    ['without movableColumns', { props: { ...props, movableColumns: false } }],
    ['without movableRows', { props: { ...props, movableRows: false } }],
    ['without fillHandle', { props: { ...props, fillHandle: false, selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } } }],
    ['with columnOrder', { props: { ...props, columnOrder: ['role', 'name'] } }],
    ['with columnWidths', { props: { ...props, columnWidths: { name: 200 } } }],
    ['with rowHeight', { props: { ...props, rowHeight: 48 } }],
    ['with as', { props: { ...props, as: 'section' } }],
    ['with class', { props: { ...props, class: 'h-96' } }],
    ['with ui', { props: { ...props, ui: { cell: 'font-mono' } } }],
    ['with empty', { props: { 'aria-label': 'People', columns, 'empty': 'Nothing here' } }],
    ['with loading', { props: { ...props, loading: true } }],
    ['with loading without data', { props: { 'aria-label': 'People', columns, 'loading': true } }],
    ['with loadingColor', { props: { ...props, loading: true, loadingColor: 'neutral' } }],
    ['with loadingAnimation', { props: { ...props, loading: true, loadingAnimation: 'swing' } }],
    ['with column class and headerClass', { props: { ...props, columns: [{ key: 'name', class: (row: Row) => row.active ? 'font-bold' : '', headerClass: 'italic' }] } }],
    ['with column editable function', { props: { ...props, columns: [{ key: 'name', editable: (row: Row) => row.active }] } }],
    // Slots
    ['with cell slot', { props, slots: { cell: ({ value }: any) => `cell ${value}` } }],
    ['with name-cell slot', { props, slots: { 'name-cell': ({ value }: any) => `name ${value}` } }],
    ['with header slot', { props, slots: { header: ({ column }: any) => `header ${column.key}` } }],
    ['with age-header slot', { props, slots: { 'age-header': () => 'Age header' } }],
    ['with row-header slot', { props, slots: { 'row-header': ({ rowIndex }: any) => `#${rowIndex}` } }],
    ['with empty slot', { props: { 'aria-label': 'People', columns }, slots: { empty: () => 'Empty slot' } }],
    ['with loading slot', { props: { 'aria-label': 'People', columns, 'loading': true }, slots: { loading: () => 'Loading slot' } }]
  ])

  it('passes accessibility tests', async () => {
    const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 1, column: 1 } } })
    expect(await axe(wrapper.find('[role=grid]').element)).toHaveNoViolations()
    wrapper.unmount()
  })

  describe('grid semantics', () => {
    it('exposes the total row and column counts', async () => {
      const wrapper = await mount()
      const grid = wrapper.find('[role=grid]')
      expect(grid.attributes('aria-rowcount')).toBe('4')
      expect(grid.attributes('aria-colcount')).toBe('5')
      expect(grid.attributes('aria-multiselectable')).toBe('true')
      expect(getCell(wrapper, 2, 3).attributes('aria-colindex')).toBe('5')
      expect(getCell(wrapper, 2, 3).element.parentElement!.getAttribute('aria-rowindex')).toBe('4')
      wrapper.unmount()
    })

    it('keeps a single tab stop on the active cell', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 1, column: 2 }, focus: { row: 1, column: 2 } } })
      const stops = wrapper.findAll('[role=gridcell][tabindex="0"]')
      expect(stops).toHaveLength(1)
      expect(stops[0]!.attributes('data-row')).toBe('1')
      expect(stops[0]!.attributes('data-column')).toBe('2')
      wrapper.unmount()
    })

    it('marks the grid read only when not editable', async () => {
      const wrapper = await mount({ editable: false })
      expect(wrapper.find('[role=grid]').attributes('aria-readonly')).toBe('true')
      wrapper.unmount()
    })

    it('marks non editable columns read only', async () => {
      const wrapper = await mount({ columns: [{ key: 'name', editable: false }, { key: 'age' }] })
      expect(getCell(wrapper, 0, 0).attributes('aria-readonly')).toBe('true')
      expect(getCell(wrapper, 0, 1).attributes('aria-readonly')).toBeUndefined()
      wrapper.unmount()
    })
  })

  describe('keyboard navigation', () => {
    it('moves the active cell with arrow keys, Home and End', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })

      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown' })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 1, column: 0 }, focus: { row: 1, column: 0 } })

      await keydown(getCell(wrapper, 1, 0), { key: 'ArrowRight' })
      expect(wrapper.props('selection').anchor).toEqual({ row: 1, column: 1 })

      await keydown(getCell(wrapper, 1, 1), { key: 'End' })
      expect(wrapper.props('selection').anchor).toEqual({ row: 1, column: 3 })

      await keydown(getCell(wrapper, 1, 3), { key: 'Home', ctrlKey: true })
      expect(wrapper.props('selection').anchor).toEqual({ row: 0, column: 0 })

      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowUp' })
      expect(wrapper.props('selection').anchor).toEqual({ row: 0, column: 0 })

      await keydown(getCell(wrapper, 0, 0), { key: 'End', ctrlKey: true })
      expect(wrapper.props('selection').anchor).toEqual({ row: 2, column: 3 })
      wrapper.unmount()
    })

    it('moves DOM focus with the active cell', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown' })
      expect(document.activeElement).toBe(getCell(wrapper, 1, 0).element)
      wrapper.unmount()
    })

    it('extends the selection with Shift', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown', shiftKey: true })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowRight', shiftKey: true })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 0 }, focus: { row: 1, column: 1 } })
      expect(getCell(wrapper, 1, 1).attributes('aria-selected')).toBe('true')
      expect(getCell(wrapper, 2, 2).attributes('aria-selected')).toBe('false')
      wrapper.unmount()
    })

    it('does not extend the selection when not selectable', async () => {
      const wrapper = await mount({ selectable: false, selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown', shiftKey: true })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 1, column: 0 }, focus: { row: 1, column: 0 } })
      expect(getCell(wrapper, 1, 0).attributes('aria-selected')).toBeUndefined()
      wrapper.unmount()
    })

    it('selects everything with Ctrl+A, a row with Shift+Space and a column with Ctrl+Space', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 1, column: 1 }, focus: { row: 1, column: 1 } } })

      await keydown(getCell(wrapper, 1, 1), { key: 'a', ctrlKey: true })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 0 }, focus: { row: 2, column: 3 } })

      await wrapper.setProps({ selection: { anchor: { row: 1, column: 1 }, focus: { row: 1, column: 1 } } })
      await keydown(getCell(wrapper, 1, 1), { key: ' ', shiftKey: true })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 1, column: 0 }, focus: { row: 1, column: 3 } })

      await wrapper.setProps({ selection: { anchor: { row: 1, column: 1 }, focus: { row: 1, column: 1 } } })
      await keydown(getCell(wrapper, 1, 1), { key: ' ', ctrlKey: true })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 1 }, focus: { row: 2, column: 1 } })
      wrapper.unmount()
    })

    it('collapses the selection with Escape', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 2, column: 2 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'Escape' })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } })
      wrapper.unmount()
    })

    it('leaves Tab to move focus out of the grid', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      const event = await keydown(getCell(wrapper, 0, 0), { key: 'Tab' })
      expect(event.defaultPrevented).toBe(false)
      wrapper.unmount()
    })
  })

  describe('editing', () => {
    it('edits with Enter and commits with Enter, moving down', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'Enter' })

      const input = getCell(wrapper, 0, 0).find('input')
      expect(input.exists()).toBe(true)
      expect(input.element.value).toBe('Alice')
      expect(document.activeElement).toBe(input.element)

      await input.setValue('Alicia')
      await keydown(input, { key: 'Enter' })

      expect(wrapper.props('data')[0].name).toBe('Alicia')
      expect(data[0]!.name).toBe('Alice')
      expect(wrapper.props('selection').anchor).toEqual({ row: 1, column: 0 })
      expect(emitted(wrapper, 'change')?.[0]?.[0]).toEqual([expect.objectContaining({ rowIndex: 0, key: 'name', value: 'Alicia', oldValue: 'Alice' })])
      wrapper.unmount()
    })

    it('edits with F2 and cancels with Escape', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'F2' })
      const input = getCell(wrapper, 0, 0).find('input')
      await input.setValue('Changed')
      await keydown(input, { key: 'Escape' })

      expect(getCell(wrapper, 0, 0).find('input').exists()).toBe(false)
      expect(wrapper.props('data')[0].name).toBe('Alice')
      expect(document.activeElement).toBe(getCell(wrapper, 0, 0).element)
      wrapper.unmount()
    })

    it('starts editing by typing, replacing the value', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 1 }, focus: { row: 0, column: 1 } } })
      await keydown(getCell(wrapper, 0, 1), { key: '9' })
      const input = getCell(wrapper, 0, 1).find('input')
      expect(input.element.value).toBe('9')
      await keydown(input, { key: 'Tab' })
      expect(wrapper.props('data')[0].age).toBe(9)
      expect(wrapper.props('selection').anchor).toEqual({ row: 0, column: 2 })
      wrapper.unmount()
    })

    it('rejects invalid numbers', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 1 }, focus: { row: 0, column: 1 } } })
      await keydown(getCell(wrapper, 0, 1), { key: 'x' })
      await keydown(getCell(wrapper, 0, 1).find('input'), { key: 'Enter' })
      expect(wrapper.props('data')[0].age).toBe(31)
      wrapper.unmount()
    })

    it('uses the column parse function', async () => {
      const wrapper = await mount({
        columns: [{ key: 'name', parse: (input: string) => input.toUpperCase() }],
        selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } }
      })
      await keydown(getCell(wrapper, 0, 0), { key: 'z' })
      await keydown(getCell(wrapper, 0, 0).find('input'), { key: 'Enter' })
      expect(wrapper.props('data')[0].name).toBe('Z')
      wrapper.unmount()
    })

    it('edits select columns with a native select', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 1, column: 3 }, focus: { row: 1, column: 3 } } })
      await keydown(getCell(wrapper, 1, 3), { key: 'Enter' })
      const select = getCell(wrapper, 1, 3).find('select')
      expect(select.exists()).toBe(true)
      await select.setValue('0')
      expect(wrapper.props('data')[1].role).toBe('admin')
      wrapper.unmount()
    })

    it('toggles checkboxes with Space', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 1, column: 2 }, focus: { row: 1, column: 2 } } })
      expect(getCell(wrapper, 1, 2).find('[role=checkbox]').attributes('aria-checked')).toBe('false')
      await keydown(getCell(wrapper, 1, 2), { key: ' ' })
      expect(wrapper.props('data')[1].active).toBe(true)
      expect(getCell(wrapper, 1, 2).find('[role=checkbox]').attributes('aria-checked')).toBe('true')
      wrapper.unmount()
    })

    it('clears the selection with Delete', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 1, column: 2 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'Delete' })
      expect(wrapper.props('data').slice(0, 2)).toEqual([
        { name: '', age: null, active: false, role: 'admin' },
        { name: '', age: null, active: false, role: 'user' }
      ])
      wrapper.unmount()
    })

    it('fills down with Ctrl+D', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 2, column: 1 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'd', ctrlKey: true })
      expect(wrapper.props('data').map((row: Row) => [row.name, row.age])).toEqual([['Alice', 31], ['Alice', 31], ['Alice', 31]])
      wrapper.unmount()
    })

    it('does not edit when not editable', async () => {
      const wrapper = await mount({ editable: false, selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'Enter' })
      expect(getCell(wrapper, 0, 0).find('input').exists()).toBe(false)
      await keydown(getCell(wrapper, 0, 0), { key: 'Delete' })
      await keydown(getCell(wrapper, 0, 0), { key: 'x' })
      expect(wrapper.props('data')).toBe(data)
      wrapper.unmount()
    })

    it('does not edit read only columns', async () => {
      const wrapper = await mount({ columns: [{ key: 'name', editable: false }], selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'Enter' })
      expect(getCell(wrapper, 0, 0).find('input').exists()).toBe(false)
      wrapper.unmount()
    })

    it('renders the editor slot', async () => {
      const wrapper = await mountSuspended(Spreadsheet, {
        attachTo: document.body,
        props: { data, columns, selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } } as any,
        slots: { 'name-editor': ({ draft }: any) => `custom editor ${draft}` }
      })
      await keydown(getCell(wrapper as any, 0, 0), { key: 'Enter' })
      expect(getCell(wrapper as any, 0, 0).text()).toBe('custom editor Alice')
      wrapper.unmount()
    })
  })

  describe('history', () => {
    it('undoes and redoes changes', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'Delete' })
      expect(wrapper.props('data')[0].name).toBe('')

      await keydown(getCell(wrapper, 0, 0), { key: 'z', ctrlKey: true })
      expect(wrapper.props('data')[0].name).toBe('Alice')

      await keydown(getCell(wrapper, 0, 0), { key: 'y', ctrlKey: true })
      expect(wrapper.props('data')[0].name).toBe('')
      wrapper.unmount()
    })

    it('does not keep history when disabled', async () => {
      const wrapper = await mount({ history: false, selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'Delete' })
      await keydown(getCell(wrapper, 0, 0), { key: 'z', ctrlKey: true })
      expect(wrapper.props('data')[0].name).toBe('')
      wrapper.unmount()
    })
  })

  describe('clipboard', () => {
    it('copies the selection as tab-separated values', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 1, column: 2 } } })
      const { event, setData } = clipboardEvent('copy')
      getCell(wrapper, 0, 0).element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(setData).toHaveBeenCalledWith('text/plain', 'Alice\t31\tTRUE\nBob\t27\tFALSE')
      wrapper.unmount()
    })

    it('cuts the selection', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      const { event, setData } = clipboardEvent('cut')
      getCell(wrapper, 0, 0).element.dispatchEvent(event)
      await flushPromises()
      expect(setData).toHaveBeenCalledWith('text/plain', 'Alice')
      expect(wrapper.props('data')[0].name).toBe('')
      wrapper.unmount()
    })

    it('pastes a block, parsing values per column', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 1, column: 0 }, focus: { row: 1, column: 0 } } })
      const { event } = clipboardEvent('paste', 'Dan\t52\tyes\nEve\tnope\tfalse')
      getCell(wrapper, 1, 0).element.dispatchEvent(event)
      await flushPromises()
      expect(wrapper.props('data').slice(1)).toEqual([
        { name: 'Dan', age: 52, active: true, role: 'user' },
        { name: 'Eve', age: 45, active: false, role: 'user' }
      ])
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 1, column: 0 }, focus: { row: 2, column: 2 } })
      wrapper.unmount()
    })

    it('appends rows when pasting past the last row', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 2, column: 0 }, focus: { row: 2, column: 0 } } })
      const { event } = clipboardEvent('paste', 'X\nY\nZ')
      getCell(wrapper, 2, 0).element.dispatchEvent(event)
      await flushPromises()
      expect(wrapper.props('data').map((row: Row) => row.name)).toEqual(['Alice', 'Bob', 'X', 'Y', 'Z'])
      wrapper.unmount()
    })

    it('fills the selection with a single value', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 1 }, focus: { row: 2, column: 1 } } })
      const { event } = clipboardEvent('paste', '10')
      getCell(wrapper, 0, 1).element.dispatchEvent(event)
      await flushPromises()
      expect(wrapper.props('data').map((row: Row) => row.age)).toEqual([10, 10, 10])
      wrapper.unmount()
    })

    it('ignores the clipboard when disabled', async () => {
      const wrapper = await mount({ clipboard: false, selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      const { event, setData } = clipboardEvent('copy')
      getCell(wrapper, 0, 0).element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
      expect(setData).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('pointer', () => {
    it('selects a cell on click and extends with Shift', async () => {
      const wrapper = await mount()
      await pointerdown(getCell(wrapper, 0, 0))
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } })
      await pointerdown(getCell(wrapper, 2, 1), { shiftKey: true })
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 0 }, focus: { row: 2, column: 1 } })
      wrapper.unmount()
    })

    it('selects a column from its header and a row from its header', async () => {
      const wrapper = await mount()
      await pointerdown(wrapper.find('[role=columnheader][data-column="1"]'))
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 1 }, focus: { row: 2, column: 1 } })
      expect(wrapper.find('[role=columnheader][data-column="1"]').attributes('data-highlighted')).toBe('true')

      await pointerdown(wrapper.find('[role=rowheader][data-row="2"]'))
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 2, column: 0 }, focus: { row: 2, column: 3 } })
      wrapper.unmount()
    })

    it('selects everything from the corner', async () => {
      const wrapper = await mount()
      await pointerdown(wrapper.find('[data-corner]'))
      expect(wrapper.props('selection')).toEqual({ anchor: { row: 0, column: 0 }, focus: { row: 2, column: 3 } })
      wrapper.unmount()
    })

    it('toggles a checkbox on click', async () => {
      const wrapper = await mount()
      await pointerdown(getCell(wrapper, 1, 2).find('[data-checkbox]'))
      expect(wrapper.props('data')[1].active).toBe(true)
      wrapper.unmount()
    })

    it('edits on double click', async () => {
      const wrapper = await mount()
      await getCell(wrapper, 0, 0).trigger('dblclick')
      expect(getCell(wrapper, 0, 0).find('input').exists()).toBe(true)
      wrapper.unmount()
    })
  })

  describe('rows and columns', () => {
    it('moves columns with Alt+Shift+Arrow', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowRight', altKey: true, shiftKey: true })
      expect(wrapper.props('columnOrder')).toEqual(['age', 'name', 'active', 'role'])
      expect(wrapper.props('selection').anchor).toEqual({ row: 0, column: 1 })
      expect(wrapper.findAll('[role=columnheader][data-column]').map(header => header.text())).toEqual(['Age', 'Name', 'Active', 'Role'])
      wrapper.unmount()
    })

    it('moves rows with Alt+Shift+Arrow', async () => {
      const wrapper = await mount({ selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown', altKey: true, shiftKey: true })
      expect(wrapper.props('data').map((row: Row) => row.name)).toEqual(['Bob', 'Alice', 'Carol'])
      expect(wrapper.props('selection').anchor).toEqual({ row: 1, column: 0 })
      wrapper.unmount()
    })

    it('does not move columns or rows when disabled', async () => {
      const wrapper = await mount({ movableColumns: false, movableRows: false, selection: { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } } })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowRight', altKey: true, shiftKey: true })
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown', altKey: true, shiftKey: true })
      expect(wrapper.props('columnOrder')).toBeUndefined()
      expect(wrapper.props('data')).toBe(data)
      expect(wrapper.find('[data-drag-handle]').exists()).toBe(false)
      wrapper.unmount()
    })

    it('respects the column order', async () => {
      const wrapper = await mount({ columnOrder: ['role', 'name'] })
      expect(wrapper.findAll('[role=columnheader][data-column]').map(header => header.text())).toEqual(['Role', 'Name', 'Age', 'Active'])
      wrapper.unmount()
    })

    it('derives columns from the data', async () => {
      const wrapper = await mount({ columns: undefined })
      expect(wrapper.findAll('[role=columnheader][data-column]').map(header => header.text())).toEqual(['name', 'age', 'active', 'role'])
      wrapper.unmount()
    })
  })

  describe('configuration', () => {
    const active = { anchor: { row: 0, column: 0 }, focus: { row: 0, column: 0 } }

    it('decides editability per row with a column function', async () => {
      const wrapper = await mount({ columns: [{ key: 'name', editable: (row: Row) => row.active }], selection: active })
      expect(getCell(wrapper, 1, 0).attributes('aria-readonly')).toBe('true')
      expect(getCell(wrapper, 0, 0).attributes('aria-readonly')).toBeUndefined()
      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown' })
      await keydown(getCell(wrapper, 1, 0), { key: 'Enter' })
      expect(getCell(wrapper, 1, 0).find('input').exists()).toBe(false)
      wrapper.unmount()
    })

    it('applies column classes per row and header classes', async () => {
      const wrapper = await mount({ columns: [{ key: 'name', class: (row: Row) => row.active ? 'font-bold' : 'italic', headerClass: 'underline' }] })
      expect(getCell(wrapper, 0, 0).classes()).toContain('font-bold')
      expect(getCell(wrapper, 1, 0).classes()).toContain('italic')
      expect(wrapper.find('[role=columnheader][data-column="0"]').classes()).toContain('underline')
      wrapper.unmount()
    })

    it('moves right after Enter with enterDirection end, and stays with none', async () => {
      const wrapper = await mount({ enterDirection: 'end', selection: active })
      await keydown(getCell(wrapper, 0, 0), { key: 'Enter' })
      await keydown(getCell(wrapper, 0, 0).find('input'), { key: 'Enter' })
      expect(wrapper.props('selection').anchor).toEqual({ row: 0, column: 1 })

      await wrapper.setProps({ enterDirection: 'none' })
      await keydown(getCell(wrapper, 0, 1), { key: 'Enter' })
      await keydown(getCell(wrapper, 0, 1).find('input'), { key: 'Enter' })
      expect(wrapper.props('selection').anchor).toEqual({ row: 0, column: 1 })
      wrapper.unmount()
    })

    it('does not edit on typing without editOnType', async () => {
      const wrapper = await mount({ editOnType: false, selection: active })
      await keydown(getCell(wrapper, 0, 0), { key: 'x' })
      expect(getCell(wrapper, 0, 0).find('input').exists()).toBe(false)
      wrapper.unmount()
    })

    it('sets the editor placeholder', async () => {
      const wrapper = await mount({ columns: [{ key: 'name', placeholder: 'Full name' }], selection: active })
      await keydown(getCell(wrapper, 0, 0), { key: 'Enter' })
      expect(getCell(wrapper, 0, 0).find('input').attributes('placeholder')).toBe('Full name')
      wrapper.unmount()
    })

    it('clamps widths to minColumnWidth', async () => {
      const wrapper = await mount({ minColumnWidth: 100, columns: [{ key: 'name', width: 20 }] })
      expect(wrapper.find('[role=columnheader][data-column="0"]').attributes('style')).toContain('width: 100px')
      wrapper.unmount()
    })

    it('renders the empty text and the loading state', async () => {
      const wrapper = await mount({ data: [], empty: 'Nothing' })
      expect(wrapper.find('[data-slot=empty]').text()).toBe('Nothing')
      await wrapper.setProps({ loading: true })
      expect(wrapper.find('[data-slot=loading]').exists()).toBe(true)
      expect(wrapper.find('[role=grid]').attributes('aria-busy')).toBe('true')
      wrapper.unmount()
    })

    it('emits edit, sort, row and column events', async () => {
      const wrapper = await mount({ selection: active })
      await keydown(getCell(wrapper, 0, 0), { key: 'Enter' })
      expect(emitted(wrapper, 'edit-start')?.[0]).toEqual([{ row: 0, column: 0 }])
      await keydown(getCell(wrapper, 0, 0).find('input'), { key: 'Escape' })
      expect(emitted(wrapper, 'edit-end')?.[0]).toEqual([{ row: 0, column: 0 }, true])

      await keydown(getCell(wrapper, 0, 0), { key: 'ArrowDown', altKey: true, shiftKey: true })
      expect(emitted(wrapper, 'row-move')?.[0]).toEqual([0, 1])
      await keydown(getCell(wrapper, 1, 0), { key: 'ArrowRight', altKey: true, shiftKey: true })
      expect(emitted(wrapper, 'column-move')?.[0]).toEqual(['name', 0, 1])
      wrapper.unmount()
    })
  })

  describe('virtualization', () => {
    const many = Array.from({ length: 200 }, (_, i) => ({ name: `Row ${i}`, age: i, active: false, role: null }))
    const wide = Array.from({ length: 40 }, (_, i) => ({ key: `c${i}` as any }))

    it('renders a window of rows and columns', async () => {
      const wrapper = await mount({ data: many, columns: wide })
      expect(wrapper.findAll('[role=row][aria-rowindex]').length).toBeLessThan(many.length)
      expect(wrapper.findAll('[role=columnheader][data-column]').length).toBeLessThan(wide.length)
      expect(wrapper.find('[role=grid]').attributes('aria-rowcount')).toBe('201')
      wrapper.unmount()
    })

    it('keeps the active cell rendered', async () => {
      const wrapper = await mount({ data: many, columns: wide, selection: { anchor: { row: 150, column: 30 }, focus: { row: 150, column: 30 } } })
      expect(getCell(wrapper, 150, 30).exists()).toBe(true)
      expect(getCell(wrapper, 150, 30).attributes('tabindex')).toBe('0')
      wrapper.unmount()
    })

    it('renders everything when disabled', async () => {
      const wrapper = await mount({ data: many, columns: wide, virtualize: false })
      expect(wrapper.findAll('[role=row]').length).toBe(many.length + 1)
      expect(wrapper.findAll('[role=columnheader][data-column]').length).toBe(wide.length)
      wrapper.unmount()
    })
  })
})
