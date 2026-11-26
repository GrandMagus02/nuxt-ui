<script setup lang="ts">
import type { SpreadsheetColumn, SpreadsheetSelection } from '@nuxt/ui'

type Employee = {
  id: number
  name: string
  email: string
  department: string
  salary: number | null
  bonus: number | null
  remote: boolean
  city: string
  [key: string]: any
}

const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support']
const cities = ['Paris', 'London', 'Berlin', 'Madrid', 'Lisbon', 'Rome']
const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn']

const rowCount = ref(1000)

function makeRows(count: number): Employee[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${names[i % names.length]} ${String.fromCharCode(65 + (i % 26))}.`,
    email: `${names[i % names.length]!.toLowerCase()}${i + 1}@example.com`,
    department: departments[i % departments.length]!,
    salary: 40000 + ((i * 7919) % 60000),
    bonus: i % 3 ? 1000 + ((i * 31) % 4000) : null,
    remote: i % 2 === 0,
    city: cities[i % cities.length]!
  }))
}

const data = ref<Employee[]>(makeRows(rowCount.value))
watch(rowCount, count => (data.value = makeRows(count)))

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const columns: SpreadsheetColumn<Employee>[] = [
  { key: 'id', label: 'ID', type: 'number', width: 72, editable: false, movable: false },
  { key: 'name', label: 'Name', width: 160 },
  { key: 'email', label: 'Email', width: 220 },
  { key: 'department', label: 'Department', type: 'select', options: departments, width: 140 },
  { key: 'salary', label: 'Salary', type: 'number', format: value => value == null ? '' : currency.format(value) },
  { key: 'bonus', label: 'Bonus', type: 'number', format: value => value == null ? '' : currency.format(value) },
  { key: 'remote', label: 'Remote', type: 'checkbox', width: 96 },
  { key: 'city', label: 'City', type: 'select', options: cities },
  ...Array.from({ length: 30 }, (_, i) => ({ key: `extra${i + 1}`, label: `Extra ${i + 1}`, width: 110 }))
]

const selection = ref<SpreadsheetSelection | null>(null)
const columnOrder = ref<string[]>()
const columnWidths = ref<Record<string, number>>({})

const options = reactive({
  editable: true,
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

const lastChange = ref('')
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <USwitch
        v-for="(_, key) in options"
        :key="key"
        v-model="options[key]"
        :label="key"
        size="sm"
      />
      <USelect v-model="rowCount" :items="[10, 100, 1000, 10000, 100000]" size="sm" class="w-28" />
    </div>

    <USpreadsheet
      v-model:data="data"
      v-model:selection="selection"
      v-model:column-order="columnOrder"
      v-model:column-widths="columnWidths"
      :columns="columns"
      v-bind="options"
      aria-label="Employees"
      class="h-[560px]"
      @change="changes => lastChange = changes.slice(0, 5).map(change => `${change.key}[${change.rowIndex}] = ${change.value}`).join(', ')"
    />

    <div class="flex flex-col gap-1 font-mono text-xs text-muted">
      <span>selection: {{ selection }}</span>
      <span>last change: {{ lastChange }}</span>
    </div>
  </div>
</template>
