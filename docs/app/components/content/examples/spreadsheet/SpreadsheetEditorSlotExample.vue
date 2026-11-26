<script setup lang="ts">
import type { SpreadsheetColumn } from '@nuxt/ui'

type Booking = {
  guest: string
  nights: number
}

const data = ref<Booking[]>([
  { guest: 'Alex', nights: 2 },
  { guest: 'Sam', nights: 5 },
  { guest: 'Jordan', nights: 1 }
])

const columns: SpreadsheetColumn<Booking>[] = [
  { key: 'guest', label: 'Guest', width: 180 },
  { key: 'nights', label: 'Nights', type: 'number', width: 180 }
]
</script>

<template>
  <USpreadsheet v-model:data="data" :columns="columns" aria-label="Bookings" class="w-full">
    <template #nights-editor="{ value, update }">
      <UInputNumber
        :default-value="value"
        :min="1"
        :max="30"
        size="sm"
        class="absolute inset-0 z-1"
        :ui="{ base: 'h-full rounded-none' }"
        @update:model-value="update"
      />
    </template>
  </USpreadsheet>
</template>
