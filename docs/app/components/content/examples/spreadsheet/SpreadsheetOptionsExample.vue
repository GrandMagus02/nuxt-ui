<script setup lang="ts">
import type { SpreadsheetColumn } from '@nuxt/ui'

type Expense = {
  date: string
  merchant: string
  amount: number
  reimbursed: boolean
}

const data = ref<Expense[]>([
  { date: '2026-11-02', merchant: 'Train', amount: 84, reimbursed: true },
  { date: '2026-11-03', merchant: 'Hotel', amount: 312, reimbursed: false },
  { date: '2026-11-03', merchant: 'Lunch', amount: 26, reimbursed: false },
  { date: '2026-11-04', merchant: 'Taxi', amount: 41, reimbursed: true }
])

const columns: SpreadsheetColumn<Expense>[] = [
  { key: 'date', label: 'Date' },
  { key: 'merchant', label: 'Merchant' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'reimbursed', label: 'Reimbursed', type: 'checkbox' }
]

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
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex flex-wrap gap-x-4 gap-y-2">
      <USwitch
        v-for="(_, key) in options"
        :key="key"
        v-model="options[key]"
        :label="key"
        size="xs"
      />
    </div>

    <USpreadsheet v-model:data="data" :columns="columns" v-bind="options" aria-label="Expenses" />
  </div>
</template>
