<script setup lang="ts">
import type { SpreadsheetColumn } from '@nuxt/ui'

const columns: SpreadsheetColumn[] = Array.from({ length: 50 }, (_, i) => ({
  key: `c${i}`,
  label: `Column ${i + 1}`,
  type: 'number',
  width: 112
}))

const data = ref(Array.from({ length: 10000 }, (_, row) =>
  Object.fromEntries(columns.map((column, i) => [column.key, row * 50 + i]))
))
</script>

<template>
  <USpreadsheet v-model:data="data" :columns="columns" aria-label="Numbers" class="h-96 w-full" />
</template>
