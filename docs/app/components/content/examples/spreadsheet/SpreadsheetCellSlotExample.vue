<script setup lang="ts">
import type { SpreadsheetColumn } from '@nuxt/ui'

type Task = {
  title: string
  status: 'todo' | 'doing' | 'done'
  progress: number | null
}

const data = ref<Task[]>([
  { title: 'Write the spec', status: 'done', progress: 100 },
  { title: 'Build the prototype', status: 'doing', progress: 60 },
  { title: 'Usability testing', status: 'todo', progress: 0 },
  { title: 'Ship it', status: 'todo', progress: 0 }
])

const columns: SpreadsheetColumn<Task>[] = [
  { key: 'title', label: 'Title', width: 200 },
  { key: 'status', label: 'Status', type: 'select', options: ['todo', 'doing', 'done'] },
  { key: 'progress', label: 'Progress', type: 'number', width: 160 }
]

const colors = { todo: 'neutral', doing: 'warning', done: 'success' } as const
</script>

<template>
  <USpreadsheet v-model:data="data" :columns="columns" aria-label="Tasks" class="w-full">
    <template #status-cell="{ value }">
      <UBadge :color="colors[value as Task['status']]" variant="subtle" :label="value" />
    </template>

    <template #progress-cell="{ value }">
      <UProgress :model-value="value ?? 0" size="sm" class="w-full" />
    </template>
  </USpreadsheet>
</template>
