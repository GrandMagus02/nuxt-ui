---
title: Spreadsheet
description: An editable grid of cells with keyboard navigation, range selection, clipboard, fill handle and movable columns and rows.
category: data
keywords:
  - data grid
  - datagrid
  - editable grid
  - excel
  - sheet
links:
  - label: Pragmatic drag and drop
    icon: i-simple-icons-atlassian
    to: https://atlassian.design/components/pragmatic-drag-and-drop
  - label: WAI-ARIA Grid
    icon: i-simple-icons-w3c
    to: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/nuxt/ui/blob/v4/src/runtime/components/Spreadsheet.vue
navigation.badge: Soon
---

## Usage

The Spreadsheet component edits an array of objects the way spreadsheet apps do: select ranges with the mouse or the keyboard, type over a cell, copy and paste from Excel or Google Sheets, extend values with the fill handle, undo, and drag columns and rows to reorder them.

It follows the [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/): the grid is a single tab stop, arrow keys move between cells, and editing is a separate mode you enter and leave with the keyboard. Rows and columns are virtualized, so large sheets stay fast.

::component-example
---
name: 'spreadsheet-example'
class: '!p-0'
---
::

### Data

Use the `v-model:data` directive to bind an array of objects. Each object is a row. Edits replace the changed rows with copies, so the original objects are never mutated.

::tip
Without `columns`, a column is created for each key of the first row.
::

### Columns

Use the `columns` prop to choose the columns and how each one behaves. A column takes:

- `key`{lang="ts-type"}: the key of each row holding the values.
- `label`{lang="ts-type"}: the header text, the `key` by default.
- `type`{lang="ts-type"}: `text`, `number`, `checkbox` or `select`. It controls the editor, the alignment and how typed or pasted text is parsed.
- `options`{lang="ts-type"}: the choices of a `select` column, as values or `{ label, value }` objects.
- `width`{lang="ts-type"}, `minWidth`{lang="ts-type"} and `maxWidth`{lang="ts-type"}: the size in pixels. Columns without them use the `default-column-width` and `min-column-width` props.
- `align`{lang="ts-type"}: `start`, `center` or `end`.
- `editable`{lang="ts-type"}, `resizable`{lang="ts-type"}, `movable`{lang="ts-type"} and `sortable`{lang="ts-type"}: set to `false` to lock this column. `editable` also takes a function to lock some rows only, like `row => !row.archived`.
- `placeholder`{lang="ts-type"}: the placeholder of the editor.
- `class`{lang="ts-type"} and `headerClass`{lang="ts-type"}: classes for the cells and the header. `class` also takes a function of the row, to style cells by value.
- `format`{lang="ts-type"}: formats a value for display, like a currency. Editing and copying still use the raw value.
- `parse`{lang="ts-type"}: converts typed or pasted text to a value. Return `undefined` to reject the input.

```ts
const columns: SpreadsheetColumn<Product>[] = [
  { key: 'sku', label: 'SKU', editable: false },
  { key: 'name', label: 'Name', editable: row => !row.archived, placeholder: 'Product name' },
  { key: 'category', label: 'Category', type: 'select', options: ['Audio', 'Video'] },
  { key: 'price', label: 'Price', type: 'number', format: value => currency.format(value), class: row => row.price < 0 ? 'text-error' : '' },
  { key: 'available', label: 'Available', type: 'checkbox' }
]
```

### Options

Every feature can be turned off with a prop, so the same component works as a full editor or as a read-only grid you can still navigate and copy from.

| Prop | Default | Description |
| --- | --- | --- |
| `editable` | `true` | Change values by typing, pasting, clearing and filling. |
| `editOnType` | `true` | Start editing when a character is typed, replacing the value. |
| `selectable` | `true` | Select ranges, whole rows and whole columns. When off, only the active cell is highlighted. |
| `rowHeaders` | `true` | Show the row numbers. |
| `columnHeaders` | `true` | Show the column headers. |
| `resizableColumns` | `true` | Resize columns by dragging the edge of their header. Double click the edge to reset the width. |
| `movableColumns` | `true` | Reorder columns by dragging their header handle. |
| `movableRows` | `true` | Reorder rows by dragging their header handle. |
| `clipboard` | `true` | Copy, cut and paste as tab-separated text. |
| `fillHandle` | `true` | Show the handle that extends the selection's values to adjacent cells. |
| `history` | `true` | Undo and redo changes. A number sets how many steps are kept, `100` by default. |
| `contextMenu` | `true` | Open a menu of actions on right click. |
| `sortable` | `true` | Sort rows by a column from the context menu. |
| `insertRows` | `true` | Insert rows from the context menu, and append rows when pasting past the last row. |
| `deleteRows` | `true` | Delete rows from the context menu. |
| `virtualize` | `true` | Only render the rows and columns in view. |

::component-example
---
name: 'spreadsheet-options-example'
---
::

### Editing

Press :kbd{value="enter"} or :kbd{value="F2"}, or double click a cell, to edit its value. Typing any character starts editing and replaces the value, as in spreadsheet apps.

In edit mode, :kbd{value="enter"} saves and moves down, :kbd{value="tab"} saves and moves to the next cell, and :kbd{value="escape"} cancels. Clicking another cell saves. Set `enter-direction` to `end` to move to the next cell after :kbd{value="enter"} instead, or to `none` to stay. Set `edit-on-type` to `false` so typing does not start editing.

`number` values are parsed from the text and invalid input is rejected. `checkbox` cells toggle with :kbd{value="space"}, :kbd{value="enter"} or a click. `select` cells open a list of their `options`.

Every edit, paste, clear and fill emits a `change` event with the list of changed cells. Editing a cell also emits `edit-start` and `edit-end`, and row and column operations emit `sort`, `row-insert`, `rows-delete`, `row-move`, `column-move` and `column-resize`.

### Selection

Click and drag to select a range, or hold :kbd{value="shift"} while clicking or pressing arrow keys to extend it. Click a column or row header to select it, and the corner to select everything.

Use the `v-model:selection` directive to control the selection. It holds the `anchor`, the active cell, and the `focus`, the opposite corner of the range. Positions are row indexes in `data` and column indexes in display order.

### Clipboard

With the grid focused, :kbd{value="meta"} :kbd{value="c"}, :kbd{value="meta"} :kbd{value="x"} and :kbd{value="meta"} :kbd{value="v"} copy, cut and paste the selection as tab-separated text, the format Excel, Numbers and Google Sheets exchange. Pasted text is parsed per column and invalid values are skipped. A single value pasted over a range fills the whole range.

### Fill handle

Drag the square in the corner of the selection to extend its values down, up or sideways. Two or more numbers in an arithmetic progression continue the series, like `1, 2` → `3, 4, 5`. Anything else repeats. :kbd{value="meta"} :kbd{value="d"} fills the selection down from its first row.

### Moving and resizing

Drag the handle that appears when hovering a header to move a column or a row. Drag the edge of a column header to resize it.

Use `v-model:column-order` and `v-model:column-widths` to keep these changes, for example in local storage. Moving rows reorders `data`.

::component-example
---
name: 'spreadsheet-models-example'
---
::

::note
Dragging uses [Pragmatic drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop), a tiny framework agnostic library built on native drag and drop. With the keyboard, :kbd{value="alt"} :kbd{value="shift"} and the arrow keys move the active column or row.
::

### Virtualization

Rows and columns outside the view are not rendered, so sheets with thousands of rows and dozens of columns scroll smoothly. Give the spreadsheet a bounded height, with a class like `h-96`, for virtualization to apply.

Pass an object to tune it: `{ rows: true, columns: false, overscan: 4 }`. `initialRows` and `initialColumns` set how many are rendered before the size of the spreadsheet is known, during server-side rendering. Set `virtualize` to `false` to render every cell, for small sheets that should grow with their content.

::component-example
---
name: 'spreadsheet-virtualize-example'
class: '!p-0'
---
::

::note
Rows have a fixed height, set by `size` or the `row-height` prop, so the visible rows can be computed without measuring them.
::

### Context menu

Pass an object to the `context-menu` prop to configure the [ContextMenu](/docs/components/context-menu) component, like `{ modal: false }`. Use the `context-menu-items` prop to add, remove or reorder items. It receives the default items, grouped, and the selection:

```ts
function contextMenuItems(items: ContextMenuItem[][], { range }: SpreadsheetContextMenuContext) {
  return [...items, [{ label: 'Export selection', icon: 'i-lucide-download', onSelect: () => exportRange(range) }]]
}
```

### Empty and loading

The `empty` prop, or the `#empty` slot, sets what is shown when there are no rows. The `loading` prop shows a loading bar under the column headers, styled with `loading-color` and `loading-animation`, and the `#loading` slot replaces the empty text while there are no rows.

### Keyboard

| Keys | Action |
| --- | --- |
| :kbd{value="arrowup"} :kbd{value="arrowdown"} :kbd{value="arrowleft"} :kbd{value="arrowright"} | Move the active cell. Hold :kbd{value="meta"} to jump to the edge. |
| :kbd{value="shift"} + arrows | Extend the selection. |
| :kbd{value="home"} :kbd{value="end"} | Move to the first or last cell of the row. Hold :kbd{value="meta"} for the first or last cell of the grid. |
| :kbd{value="pageup"} :kbd{value="pagedown"} | Move by one page of rows. |
| :kbd{value="enter"} :kbd{value="F2"} | Edit the active cell, or toggle a checkbox. |
| :kbd{value="space"} | Toggle a checkbox. With :kbd{value="shift"}, select the row. With :kbd{value="meta"}, select the column. |
| :kbd{value="delete"} :kbd{value="backspace"} | Clear the selection. |
| :kbd{value="escape"} | Collapse the selection to the active cell, or cancel editing. |
| :kbd{value="meta"} :kbd{value="a"} | Select all. |
| :kbd{value="meta"} :kbd{value="z"} / :kbd{value="meta"} :kbd{value="shift"} :kbd{value="z"} | Undo / redo. |
| :kbd{value="alt"} :kbd{value="shift"} + arrows | Move the active column or row. |
| :kbd{value="tab"} | Leave the grid. In edit mode, save and move to the next cell. |

### Accessibility

The spreadsheet renders the `grid`, `row`, `columnheader`, `rowheader` and `gridcell` roles with `aria-rowcount`, `aria-colcount`, `aria-rowindex` and `aria-colindex`, so assistive technologies announce positions even when rows are virtualized. Selected cells have `aria-selected`, and locked columns or a read-only grid have `aria-readonly`.

Focus follows the active cell with a roving `tabindex`, and the active cell stays rendered when scrolled out of view so focus is never lost. Give the grid a name with `aria-label` or `aria-labelledby`.

## Examples

### With cell slot

Use the `#<column>-cell` slot, or the `#cell` slot for every column, to render cells with components.

::component-example
---
name: 'spreadsheet-cell-slot-example'
---
::

### With editor slot

Use the `#<column>-editor` slot, or the `#editor` slot, to edit cells with your own components. Call `update` with the new value. :kbd{value="enter"}, :kbd{value="tab"}, :kbd{value="escape"} and clicking away still save or cancel, or call `commit` and `cancel` yourself.

::component-example
---
name: 'spreadsheet-editor-slot-example'
---
::

### With header slot

Use the `#<column>-header` slot, or the `#header` slot, to customize the column headers, and the `#row-header` slot for the row headers.

## API

### Props

:component-props

::callout{icon="i-simple-icons-mdnwebdocs" to="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes" target="_blank"}
This component also supports native HTML attributes, which are applied to the grid element.
::

### Slots

:component-slots

### Emits

:component-emits

### Expose

You can access the typed component instance using [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref).

```vue
<script setup lang="ts">
const spreadsheet = useTemplateRef('spreadsheet')

function goToLastRow() {
  spreadsheet.value?.select({ row: data.value.length - 1, column: 0 })
  spreadsheet.value?.scrollToCell({ row: data.value.length - 1, column: 0 })
}
</script>

<template>
  <USpreadsheet ref="spreadsheet" v-model:data="data" />
</template>
```

This will give you access to the following:

| Name | Type |
| ---- | ---- |
| `viewport`{lang="ts-type"} | `ComputedRef<HTMLElement \| undefined>`{lang="ts-type"} |
| `select(anchor, focus?)`{lang="ts-type"} | `(anchor: SpreadsheetCellPosition, focus?: SpreadsheetCellPosition) => void`{lang="ts-type"} |
| `selectAll()`{lang="ts-type"} | `() => void`{lang="ts-type"} |
| `scrollToCell(position)`{lang="ts-type"} | `(position: SpreadsheetCellPosition) => void`{lang="ts-type"} |
| `edit(position)`{lang="ts-type"} | `(position: SpreadsheetCellPosition) => void`{lang="ts-type"} |
| `undo()`{lang="ts-type"} / `redo()`{lang="ts-type"} | `() => void`{lang="ts-type"} |
| `canUndo`{lang="ts-type"} / `canRedo`{lang="ts-type"} | `ComputedRef<boolean>`{lang="ts-type"} |

## Theme

:component-theme

## Changelog

:component-changelog
