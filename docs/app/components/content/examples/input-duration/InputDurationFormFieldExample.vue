<script setup lang="ts">
// 1h 30m
const duration = ref<number | null>(5_400_000)
</script>

<template>
  <UFormField label="Duration" help="Specify the duration" required>
    <UInputDuration v-model="duration" />
  </UFormField>
</template>
