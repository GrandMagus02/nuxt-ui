<script setup lang="ts">
import type { SpreadsheetColumn, SpreadsheetSelection } from '@nuxt/ui'

type City = {
  name: string
  country: string
  population: number
}

const data = ref<City[]>([
  { name: 'Tokyo', country: 'Japan', population: 37115035 },
  { name: 'Delhi', country: 'India', population: 33807403 },
  { name: 'Shanghai', country: 'China', population: 29867918 },
  { name: 'Dhaka', country: 'Bangladesh', population: 23935652 },
  { name: 'São Paulo', country: 'Brazil', population: 22806704 }
])

const columns: SpreadsheetColumn<City>[] = [
  { key: 'name', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'population', label: 'Population', type: 'number', format: value => value?.toLocaleString() ?? '' }
]

const selection = ref<SpreadsheetSelection | null>({ anchor: { row: 0, column: 0 }, focus: { row: 1, column: 2 } })
const columnOrder = ref<string[]>(['country', 'name', 'population'])
const columnWidths = ref<Record<string, number>>({ population: 160 })
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <USpreadsheet
      v-model:data="data"
      v-model:selection="selection"
      v-model:column-order="columnOrder"
      v-model:column-widths="columnWidths"
      :columns="columns"
      aria-label="Cities"
    />

    <pre class="text-xs text-muted">{{ { selection, columnOrder, columnWidths } }}</pre>
  </div>
</template>
